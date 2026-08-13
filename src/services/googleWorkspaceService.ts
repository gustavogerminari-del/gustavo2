import { initializeApp, getApps, getApp } from 'firebase/app';
import { getAuth, signInWithPopup, GoogleAuthProvider, onAuthStateChanged, User } from 'firebase/auth';
import firebaseConfig from '../../firebase-applet-config.json';

// Initialize or reuse Firebase App instance
const app = !getApps().length ? initializeApp(firebaseConfig) : getApp();
const auth = getAuth(app);

// Scopes required for Gmail, Google Meet, and Google Chat
export const WORKSPACE_SCOPES = [
  'https://mail.google.com/',
  'https://www.googleapis.com/auth/gmail.readonly',
  'https://www.googleapis.com/auth/gmail.send',
  'https://www.googleapis.com/auth/gmail.compose',
  'https://www.googleapis.com/auth/gmail.modify',
  'https://www.googleapis.com/auth/meetings.space.created',
  'https://www.googleapis.com/auth/meetings.space.readonly',
  'https://www.googleapis.com/auth/chat.messages',
  'https://www.googleapis.com/auth/chat.messages.create',
  'https://www.googleapis.com/auth/chat.messages.readonly',
  'https://www.googleapis.com/auth/chat.spaces',
  'https://www.googleapis.com/auth/chat.spaces.readonly',
  'https://www.googleapis.com/auth/chat.memberships'
];

let isSigningIn = false;
let cachedAccessToken: string | null = null;

// Initialize auth state listener
export const initAuth = (
  onAuthSuccess?: (user: User, token: string) => void,
  onAuthFailure?: () => void
) => {
  return onAuthStateChanged(auth, async (user: User | null) => {
    if (user) {
      if (cachedAccessToken) {
        if (onAuthSuccess) onAuthSuccess(user, cachedAccessToken);
      } else if (!isSigningIn) {
        cachedAccessToken = null;
        if (onAuthFailure) onAuthFailure();
      }
    } else {
      cachedAccessToken = null;
      if (onAuthFailure) onAuthFailure();
    }
  });
};

export const googleSignIn = async (): Promise<{ user: User; accessToken: string } | null> => {
  try {
    isSigningIn = true;
    const provider = new GoogleAuthProvider();
    WORKSPACE_SCOPES.forEach(scope => provider.addScope(scope));

    const result = await signInWithPopup(auth, provider);
    const credential = GoogleAuthProvider.credentialFromResult(result);
    if (!credential?.accessToken) {
      throw new Error('Não foi possível obter o token de acesso do Google.');
    }

    cachedAccessToken = credential.accessToken;
    return { user: result.user, accessToken: cachedAccessToken };
  } catch (error: any) {
    console.error('Sign in error:', error);
    throw error;
  } finally {
    isSigningIn = false;
  }
};

export const getAccessToken = (): string | null => {
  return cachedAccessToken;
};

export const logoutWorkspace = async () => {
  await auth.signOut();
  cachedAccessToken = null;
};

// --- GMAIL SERVICES ---
export interface GmailMessage {
  id: string;
  threadId: string;
  snippet?: string;
  subject?: string;
  from?: string;
  date?: string;
}

export const gmailService = {
  async listMessages(maxResults = 10): Promise<GmailMessage[]> {
    const token = getAccessToken();
    if (!token) throw new Error('Não autenticado com o Google.');

    const res = await fetch(`https://gmail.googleapis.com/v1/users/me/messages?maxResults=${maxResults}`, {
      headers: { Authorization: `Bearer ${token}` }
    });
    if (!res.ok) throw new Error('Falha ao listar e-mails no Gmail');
    const data = await res.json();
    if (!data.messages) return [];

    const details = await Promise.all(
      data.messages.map(async (msg: { id: string }) => {
        const detailRes = await fetch(`https://gmail.googleapis.com/v1/users/me/messages/${msg.id}?format=full`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        if (!detailRes.ok) return { id: msg.id, threadId: msg.id };
        const detailData = await detailRes.json();
        const headers = detailData.payload?.headers || [];
        const subject = headers.find((h: any) => h.name.toLowerCase() === 'subject')?.value || '(Sem Assunto)';
        const from = headers.find((h: any) => h.name.toLowerCase() === 'from')?.value || 'Desconhecido';
        const date = headers.find((h: any) => h.name.toLowerCase() === 'date')?.value || '';

        return {
          id: detailData.id,
          threadId: detailData.threadId,
          snippet: detailData.snippet,
          subject,
          from,
          date
        };
      })
    );

    return details;
  },

  async sendEmail(to: string, subject: string, body: string): Promise<boolean> {
    const token = getAccessToken();
    if (!token) throw new Error('Não autenticado com o Google.');

    // Construct MIME message
    const emailLines = [
      `To: ${to}`,
      'Content-Type: text/plain; charset=utf-8',
      'MIME-Version: 1.0',
      `Subject: ${subject}`,
      '',
      body
    ];
    const email = emailLines.join('\r\n');
    const encodedEmail = btoa(unescape(encodeURIComponent(email)))
      .replace(/\+/g, '-')
      .replace(/\//g, '_')
      .replace(/=+$/, '');

    const res = await fetch('https://gmail.googleapis.com/v1/users/me/messages/send', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ raw: encodedEmail })
    });

    if (!res.ok) {
      const err = await res.json();
      throw new Error(err.error?.message || 'Erro ao enviar e-mail via Gmail.');
    }
    return true;
  }
};

// --- GOOGLE MEET SERVICES ---
export interface MeetSpace {
  name: string;
  meetingUri: string;
  meetingCode?: string;
}

export const meetService = {
  async createMeetingSpace(): Promise<MeetSpace> {
    const token = getAccessToken();
    if (!token) throw new Error('Não autenticado com o Google.');

    const res = await fetch('https://meet.googleapis.com/v1/spaces', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        config: {
          accessType: 'OPEN'
        }
      })
    });

    if (!res.ok) {
      const err = await res.json();
      throw new Error(err.error?.message || 'Erro ao criar reunião no Google Meet.');
    }

    const data = await res.json();
    return {
      name: data.name,
      meetingUri: data.meetingUri,
      meetingCode: data.meetingCode
    };
  }
};

// --- GOOGLE CHAT SERVICES ---
export interface ChatSpace {
  name: string;
  displayName?: string;
  type?: string;
}

export interface ChatMessage {
  name?: string;
  text: string;
  createTime?: string;
}

export const chatService = {
  async listSpaces(): Promise<ChatSpace[]> {
    const token = getAccessToken();
    if (!token) throw new Error('Não autenticado com o Google.');

    const res = await fetch('https://chat.googleapis.com/v1/spaces', {
      headers: { Authorization: `Bearer ${token}` }
    });

    if (!res.ok) {
      const err = await res.json();
      throw new Error(err.error?.message || 'Erro ao listar espaços do Google Chat.');
    }

    const data = await res.json();
    return data.spaces || [];
  },

  async postMessage(spaceName: string, text: string): Promise<ChatMessage> {
    const token = getAccessToken();
    if (!token) throw new Error('Não autenticado com o Google.');

    const res = await fetch(`https://chat.googleapis.com/v1/${spaceName}/messages`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ text })
    });

    if (!res.ok) {
      const err = await res.json();
      throw new Error(err.error?.message || 'Erro ao enviar mensagem no Google Chat.');
    }

    return await res.json();
  }
};
