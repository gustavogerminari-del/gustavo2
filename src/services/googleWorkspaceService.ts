// RL CONNECT - Google Workspace Integration (REST API without Firebase)

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
  'https://www.googleapis.com/auth/chat.memberships',
  'https://www.googleapis.com/auth/calendar',
  'https://www.googleapis.com/auth/calendar.events'
];

let cachedAccessToken: string | null = typeof window !== 'undefined' ? localStorage.getItem('rl_connect_google_oauth_token') : null;

export const initAuth = (
  onAuthSuccess?: (user: any, token: string) => void,
  onAuthFailure?: () => void
) => {
  const token = typeof window !== 'undefined' ? localStorage.getItem('rl_connect_google_oauth_token') : null;
  const userRaw = typeof window !== 'undefined' ? localStorage.getItem('rl_connect_google_user') : null;
  if (token) {
    cachedAccessToken = token;
    const user = userRaw ? JSON.parse(userRaw) : { displayName: 'Google Workspace Connected', email: 'workspace@rlourenco.com.br' };
    if (onAuthSuccess) onAuthSuccess(user, token);
  } else {
    cachedAccessToken = null;
    if (onAuthFailure) onAuthFailure();
  }
  return () => {};
};

export const setAccessToken = (token: string, userObj?: any) => {
  cachedAccessToken = token;
  if (typeof window !== 'undefined') {
    localStorage.setItem('rl_connect_google_oauth_token', token);
    if (userObj) {
      localStorage.setItem('rl_connect_google_user', JSON.stringify(userObj));
    }
  }
};

export const getAccessToken = (): string | null => {
  if (cachedAccessToken) return cachedAccessToken;
  if (typeof window !== 'undefined') {
    return localStorage.getItem('rl_connect_google_oauth_token');
  }
  return null;
};

export const logoutWorkspace = async () => {
  cachedAccessToken = null;
  if (typeof window !== 'undefined') {
    localStorage.removeItem('rl_connect_google_oauth_token');
    localStorage.removeItem('rl_connect_google_user');
  }
};

export const googleSignIn = async (): Promise<{ user: any; accessToken: string } | null> => {
  const token = getAccessToken();
  if (token) {
    const userRaw = localStorage.getItem('rl_connect_google_user');
    const user = userRaw ? JSON.parse(userRaw) : { displayName: 'Google Workspace Account', email: 'workspace@rlourenco.com.br' };
    return { user, accessToken: token };
  }
  throw new Error('Conecte sua conta do Google Workspace em Configurações > Integrações para agendar e gerenciar reuniões.');
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

// --- GOOGLE CALENDAR SERVICES ---
export interface CalendarEvent {
  id: string;
  summary: string;
  description?: string;
  start: { dateTime?: string; date?: string };
  end: { dateTime?: string; date?: string };
  location?: string;
  htmlLink?: string;
  hangoutLink?: string;
  attendees?: { email: string; responseStatus?: string }[];
}

export const calendarService = {
  async listUpcomingEvents(maxResults = 10): Promise<CalendarEvent[]> {
    const token = getAccessToken();
    if (!token) throw new Error('Não autenticado com o Google.');

    const nowIso = new Date().toISOString();
    const url = `https://www.googleapis.com/calendar/v3/calendars/primary/events?timeMin=${encodeURIComponent(nowIso)}&singleEvents=true&orderBy=startTime&maxResults=${maxResults}`;

    const res = await fetch(url, {
      headers: { Authorization: `Bearer ${token}` }
    });

    if (!res.ok) {
      const err = await res.json();
      throw new Error(err.error?.message || 'Erro ao buscar eventos do Google Calendar.');
    }

    const data = await res.json();
    return data.items || [];
  },

  async createEvent(
    summary: string,
    description: string,
    startIso: string,
    endIso: string,
    attendeesEmails: string[] = [],
    createMeetLink = true
  ): Promise<CalendarEvent> {
    const token = getAccessToken();
    if (!token) throw new Error('Não autenticado com o Google.');

    const eventPayload: any = {
      summary,
      description,
      start: { dateTime: startIso },
      end: { dateTime: endIso },
      attendees: attendeesEmails.filter(Boolean).map(email => ({ email }))
    };

    if (createMeetLink) {
      eventPayload.conferenceData = {
        createRequest: {
          requestId: `gestrh-meet-${Date.now()}`,
          conferenceSolutionKey: { type: 'hangoutsMeet' }
        }
      };
    }

    const url = `https://www.googleapis.com/calendar/v3/calendars/primary/events?conferenceDataVersion=1`;
    const res = await fetch(url, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(eventPayload)
    });

    if (!res.ok) {
      const err = await res.json();
      throw new Error(err.error?.message || 'Erro ao agendar evento no Google Calendar.');
    }

    return await res.json();
  },

  async deleteEvent(eventId: string): Promise<boolean> {
    const token = getAccessToken();
    if (!token) throw new Error('Não autenticado com o Google.');

    const url = `https://www.googleapis.com/calendar/v3/calendars/primary/events/${eventId}`;
    const res = await fetch(url, {
      method: 'DELETE',
      headers: { Authorization: `Bearer ${token}` }
    });

    if (!res.ok) {
      const err = await res.json();
      throw new Error(err.error?.message || 'Erro ao excluir evento do Google Calendar.');
    }

    return true;
  }
};
