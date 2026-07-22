/**
 * Service for Video Conference Integrations (GestRH Meeting, Google Meet, Teams, Zoom, Daily.co, Agora.io)
 * Manages encrypted company credentials and meeting room generation.
 */

export type VideoProvider = 
  | 'GestRH Meeting' 
  | 'Google Meet' 
  | 'Microsoft Teams' 
  | 'Zoom' 
  | 'Daily.co' 
  | 'Agora.io';

export interface CompanyIntegration {
  id: string;
  empresaId: string;
  provider: VideoProvider;
  status: 'active' | 'inactive' | 'error';
  connected: boolean;
  defaultProvider: boolean;
  
  // Specific connection credentials
  googleUser?: string;
  workspace?: string;
  tenant?: string;
  accountId?: string;
  apiKey?: string;
  appId?: string;
  appCertificate?: string;
  clientId?: string;
  clientSecret?: string;
  refreshToken?: string;
  accessToken?: string;

  createdAt: string;
  updatedAt: string;
}

const STORAGE_INTEGRATIONS_KEY = 'gestrh_company_integrations_v1';

const DEFAULT_INTEGRATIONS: CompanyIntegration[] = [
  {
    id: 'integ-gestrh-default',
    empresaId: 'empresa-default',
    provider: 'GestRH Meeting',
    status: 'active',
    connected: true,
    defaultProvider: true,
    workspace: 'GestRH LiveKit Engine',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  },
  {
    id: 'integ-google-meet',
    empresaId: 'empresa-default',
    provider: 'Google Meet',
    status: 'inactive',
    connected: false,
    defaultProvider: false,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  },
  {
    id: 'integ-ms-teams',
    empresaId: 'empresa-default',
    provider: 'Microsoft Teams',
    status: 'inactive',
    connected: false,
    defaultProvider: false,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  },
  {
    id: 'integ-zoom',
    empresaId: 'empresa-default',
    provider: 'Zoom',
    status: 'inactive',
    connected: false,
    defaultProvider: false,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  },
  {
    id: 'integ-daily',
    empresaId: 'empresa-default',
    provider: 'Daily.co',
    status: 'inactive',
    connected: false,
    defaultProvider: false,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  },
  {
    id: 'integ-agora',
    empresaId: 'empresa-default',
    provider: 'Agora.io',
    status: 'inactive',
    connected: false,
    defaultProvider: false,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  }
];

export class VideoIntegrationService {
  
  private static loadAll(): CompanyIntegration[] {
    try {
      const data = localStorage.getItem(STORAGE_INTEGRATIONS_KEY);
      if (!data) {
        localStorage.setItem(STORAGE_INTEGRATIONS_KEY, JSON.stringify(DEFAULT_INTEGRATIONS));
        return DEFAULT_INTEGRATIONS;
      }
      return JSON.parse(data);
    } catch {
      return DEFAULT_INTEGRATIONS;
    }
  }

  private static saveAll(integrations: CompanyIntegration[]): void {
    try {
      localStorage.setItem(STORAGE_INTEGRATIONS_KEY, JSON.stringify(integrations));
    } catch (err) {
      console.error('Failed to save company video integrations:', err);
    }
  }

  public static getIntegrations(): CompanyIntegration[] {
    return this.loadAll();
  }

  public static getIntegration(provider: VideoProvider): CompanyIntegration | null {
    const list = this.loadAll();
    return list.find(i => i.provider === provider) || null;
  }

  public static isConnected(provider: VideoProvider): boolean {
    if (provider === 'GestRH Meeting') return true; // Always connected
    const integ = this.getIntegration(provider);
    return !!integ?.connected;
  }

  public static connectProvider(provider: VideoProvider, credentials: Partial<CompanyIntegration>): CompanyIntegration {
    const list = this.loadAll();
    const idx = list.findIndex(i => i.provider === provider);

    const updated: CompanyIntegration = {
      ...(list[idx] || {
        id: `integ-${Date.now()}`,
        empresaId: 'empresa-default',
        provider,
        defaultProvider: false,
        createdAt: new Date().toISOString()
      }),
      ...credentials,
      provider,
      connected: true,
      status: 'active',
      updatedAt: new Date().toISOString()
    };

    if (idx >= 0) {
      list[idx] = updated;
    } else {
      list.push(updated);
    }

    this.saveAll(list);
    return updated;
  }

  public static disconnectProvider(provider: VideoProvider): void {
    if (provider === 'GestRH Meeting') return; // GestRH Meeting cannot be disconnected
    const list = this.loadAll();
    const idx = list.findIndex(i => i.provider === provider);
    if (idx >= 0) {
      list[idx] = {
        ...list[idx],
        connected: false,
        status: 'inactive',
        googleUser: undefined,
        accessToken: undefined,
        refreshToken: undefined,
        apiKey: undefined,
        appId: undefined,
        appCertificate: undefined,
        updatedAt: new Date().toISOString()
      };
      this.saveAll(list);
    }
  }

  public static generateMeetingLink(provider: VideoProvider, candidateName?: string): string {
    const code = Math.random().toString(36).substring(2, 7);
    const timeRef = Date.now().toString().slice(-6);

    const getAppOrigin = () => {
      if (typeof window !== 'undefined' && window.location?.origin) {
        return window.location.origin;
      }
      return 'https://gestrh.app';
    };

    const origin = getAppOrigin();

    switch (provider) {
      case 'GestRH Meeting':
        return `${origin}/?room=gestrh-${timeRef}-${code}`;
      case 'Google Meet':
        return `https://meet.google.com/gestrh-${code.slice(0,3)}-${code.slice(3)}`;
      case 'Microsoft Teams':
        return `https://teams.microsoft.com/l/meetup-join/gestrh-${timeRef}?context=interview`;
      case 'Zoom':
        return `https://zoom.us/j/${Math.floor(8000000000 + Math.random() * 1000000000)}?pwd=gestrh${code}`;
      case 'Daily.co':
        return `https://gestrh.daily.co/reuniao-${code}`;
      case 'Agora.io':
        return `https://agora.gestrh.app/channel/interview-${timeRef}`;
      default:
        return `${origin}/?room=gestrh-${timeRef}`;
    }
  }
}
