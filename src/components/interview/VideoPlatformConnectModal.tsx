import React, { useState } from 'react';
import { 
  X, 
  Video, 
  CheckCircle2, 
  AlertCircle, 
  Key, 
  ShieldCheck, 
  Sparkles, 
  ExternalLink,
  Lock,
  Loader2
} from 'lucide-react';
import { VideoProvider, VideoIntegrationService, CompanyIntegration } from '../../services/videoIntegrationService';

interface VideoPlatformConnectModalProps {
  isOpen: boolean;
  platform: VideoProvider;
  onClose: () => void;
  onSuccess: (provider: VideoProvider, link: string) => void;
  onFallbackToGestRH: () => void;
}

export default function VideoPlatformConnectModal({
  isOpen,
  platform,
  onClose,
  onSuccess,
  onFallbackToGestRH
}: VideoPlatformConnectModalProps) {
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  
  // Specific Form States
  const [dailyApiKey, setDailyApiKey] = useState('');
  const [dailyDomain, setDailyDomain] = useState('gestrh');

  const [agoraAppId, setAgoraAppId] = useState('');
  const [agoraAppCert, setAgoraAppCert] = useState('');

  const [zoomAccountId, setZoomAccountId] = useState('acc_zoom_gestrh_2026');
  const [zoomClientId, setZoomClientId] = useState('');
  const [zoomClientSecret, setZoomClientSecret] = useState('');

  if (!isOpen) return null;

  const handleOAuthConnect = async (p: VideoProvider) => {
    setLoading(true);
    setErrorMsg('');
    try {
      // Simulate OAuth redirect / API Token validation
      await new Promise(resolve => setTimeout(resolve, 800));

      let creds: Partial<CompanyIntegration> = {};
      if (p === 'Google Meet') {
        creds = {
          googleUser: 'empresa@empresa.com.br',
          workspace: 'Google Workspace Corporativo',
          accessToken: 'ya29.a0Axxxxxxxxxxxxxxxxxxxx',
          refreshToken: '1//0gxxxxxxxxxxxxxxxxxxxx'
        };
      } else if (p === 'Microsoft Teams') {
        creds = {
          tenant: 'tenant-ms365-gestrh-sp',
          clientId: 'ms-client-88776655',
          accessToken: 'eyJ0eXAiOiJKV1QiLCJhbGciOiJSUzI1NiIs...',
          refreshToken: 'ms-ref-tok-xxxxxxx'
        };
      } else if (p === 'Zoom') {
        creds = {
          accountId: zoomAccountId || 'acc_zoom_2026',
          clientId: zoomClientId || 'zoom_client_id_x',
          clientSecret: zoomClientSecret || 'zoom_sec_x',
          refreshToken: 'zoom-ref-xxxxxxx'
        };
      } else if (p === 'Daily.co') {
        if (!dailyApiKey.trim()) {
          setErrorMsg('Por favor, informe a API Key do Daily.co.');
          setLoading(false);
          return;
        }
        creds = {
          apiKey: dailyApiKey,
          workspace: dailyDomain || 'gestrh'
        };
      } else if (p === 'Agora.io') {
        if (!agoraAppId.trim()) {
          setErrorMsg('Por favor, informe o App ID do Agora.io.');
          setLoading(false);
          return;
        }
        creds = {
          appId: agoraAppId,
          appCertificate: agoraAppCert
        };
      }

      VideoIntegrationService.connectProvider(p, creds);
      const generatedLink = VideoIntegrationService.generateMeetingLink(p);

      setLoading(false);
      onSuccess(p, generatedLink);
    } catch (err) {
      setLoading(false);
      setErrorMsg('Falha ao conectar com o provedor. Tente novamente.');
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/80 backdrop-blur-md flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-white rounded-3xl shadow-2xl border border-slate-200 max-w-lg w-full overflow-hidden animate-in fade-in zoom-in-95 duration-200 my-8">
        
        {/* Modal Header */}
        <div className="bg-[#0b1d33] text-white p-6 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="p-2.5 bg-amber-500/20 text-amber-400 rounded-2xl border border-amber-500/30">
              <Video className="h-5 w-5" />
            </div>
            <div>
              <span className="text-[10px] font-mono font-bold text-amber-400 uppercase tracking-widest block">
                Configuração de Integração
              </span>
              <h3 className="font-display font-bold text-lg text-white">
                {platform}
              </h3>
            </div>
          </div>

          <button
            onClick={onClose}
            className="text-slate-400 hover:text-white bg-white/10 hover:bg-white/20 p-2 rounded-xl transition-all cursor-pointer"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Warning Alert Banner */}
        <div className="p-6 space-y-4 text-xs font-medium">
          <div className="bg-amber-50 border border-amber-200 text-amber-900 p-4 rounded-2xl flex items-start space-x-3">
            <AlertCircle className="h-5 w-5 text-amber-600 shrink-0 mt-0.5" />
            <div>
              <p className="font-bold text-slate-900 text-sm">
                A plataforma selecionada ainda não está conectada.
              </p>
              <p className="text-slate-600 mt-1 leading-relaxed">
                Conecte a conta ou informe as chaves API da empresa para autorizar o envio automático de salas do <strong>{platform}</strong> nas entrevistas.
              </p>
            </div>
          </div>

          {errorMsg && (
            <div className="bg-rose-50 border border-rose-200 text-rose-800 p-3 rounded-xl font-bold text-xs flex items-center space-x-2">
              <AlertCircle className="h-4 w-4 text-rose-600" />
              <span>{errorMsg}</span>
            </div>
          )}

          {/* Form per Platform */}

          {/* GOOGLE MEET */}
          {platform === 'Google Meet' && (
            <div className="space-y-4 pt-2">
              <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200 space-y-2">
                <div className="flex items-center space-x-2 text-slate-800 font-bold">
                  <ShieldCheck className="h-4 w-4 text-emerald-600" />
                  <span>Autenticação OAuth Google Workspace</span>
                </div>
                <p className="text-slate-500 text-[11px] leading-relaxed">
                  Ao clicar abaixo, você autorizará o GestRH a criar reuniões no Google Meet em nome da sua conta corporativa.
                </p>
              </div>

              <button
                type="button"
                disabled={loading}
                onClick={() => handleOAuthConnect('Google Meet')}
                className="w-full bg-white hover:bg-slate-50 text-slate-800 border-2 border-slate-300 font-bold py-3 px-4 rounded-2xl shadow-xs transition-all flex items-center justify-center space-x-3 cursor-pointer"
              >
                {loading ? (
                  <Loader2 className="h-5 w-5 animate-spin text-amber-500" />
                ) : (
                  <>
                    <svg className="h-5 w-5" viewBox="0 0 24 24">
                      <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                      <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                      <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"/>
                      <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"/>
                    </svg>
                    <span>Conectar Conta Google</span>
                  </>
                )}
              </button>
            </div>
          )}

          {/* MICROSOFT TEAMS */}
          {platform === 'Microsoft Teams' && (
            <div className="space-y-4 pt-2">
              <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200 space-y-2">
                <div className="flex items-center space-x-2 text-slate-800 font-bold">
                  <ShieldCheck className="h-4 w-4 text-indigo-600" />
                  <span>Autenticação Microsoft 365 / Teams</span>
                </div>
                <p className="text-slate-500 text-[11px] leading-relaxed">
                  Autorize a integração com o Tenant da sua empresa para agendamento de reuniões virtuais no Teams.
                </p>
              </div>

              <button
                type="button"
                disabled={loading}
                onClick={() => handleOAuthConnect('Microsoft Teams')}
                className="w-full bg-[#0078D4] hover:bg-[#0063B1] text-white font-bold py-3 px-4 rounded-2xl shadow-md transition-all flex items-center justify-center space-x-3 cursor-pointer"
              >
                {loading ? (
                  <Loader2 className="h-5 w-5 animate-spin text-white" />
                ) : (
                  <>
                    <ExternalLink className="h-5 w-5" />
                    <span>Conectar Microsoft 365</span>
                  </>
                )}
              </button>
            </div>
          )}

          {/* ZOOM */}
          {platform === 'Zoom' && (
            <div className="space-y-3 pt-2">
              <div>
                <label className="block text-slate-700 font-bold mb-1">Account ID (Opcional)</label>
                <input
                  type="text"
                  placeholder="Ex: acc_zoom_gestrh_2026"
                  value={zoomAccountId}
                  onChange={e => setZoomAccountId(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl py-2 px-3 text-slate-800"
                />
              </div>

              <div>
                <label className="block text-slate-700 font-bold mb-1">Client ID</label>
                <input
                  type="text"
                  placeholder="Ex: zoom_client_id_xxxxxx"
                  value={zoomClientId}
                  onChange={e => setZoomClientId(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl py-2 px-3 text-slate-800"
                />
              </div>

              <div>
                <label className="block text-slate-700 font-bold mb-1">Client Secret</label>
                <input
                  type="password"
                  placeholder="••••••••••••••••••••"
                  value={zoomClientSecret}
                  onChange={e => setZoomClientSecret(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl py-2 px-3 text-slate-800"
                />
              </div>

              <button
                type="button"
                disabled={loading}
                onClick={() => handleOAuthConnect('Zoom')}
                className="w-full bg-[#2D8CFF] hover:bg-[#1A73E8] text-white font-bold py-3 px-4 rounded-2xl shadow-md transition-all flex items-center justify-center space-x-2 cursor-pointer mt-2"
              >
                {loading ? <Loader2 className="h-5 w-5 animate-spin text-white" /> : <span>Conectar Conta Zoom</span>}
              </button>
            </div>
          )}

          {/* DAILY.CO */}
          {platform === 'Daily.co' && (
            <div className="space-y-3 pt-2">
              <div>
                <label className="block text-slate-700 font-bold mb-1">API Key Daily.co</label>
                <div className="relative flex items-center">
                  <Key className="h-4 w-4 text-slate-400 absolute left-3 pointer-events-none" />
                  <input
                    type="password"
                    placeholder="daily_api_key_xxxxxxxxxxxxxxxx"
                    value={dailyApiKey}
                    onChange={e => setDailyApiKey(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl py-2 pl-9 pr-3 text-slate-800"
                  />
                </div>
              </div>

              <div>
                <label className="block text-slate-700 font-bold mb-1">Nome do Domínio / Projeto</label>
                <input
                  type="text"
                  placeholder="gestrh"
                  value={dailyDomain}
                  onChange={e => setDailyDomain(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl py-2 px-3 text-slate-800"
                />
              </div>

              <button
                type="button"
                disabled={loading}
                onClick={() => handleOAuthConnect('Daily.co')}
                className="w-full bg-slate-900 hover:bg-slate-800 text-amber-400 font-bold py-3 px-4 rounded-2xl shadow-md transition-all flex items-center justify-center space-x-2 cursor-pointer mt-2"
              >
                {loading ? <Loader2 className="h-5 w-5 animate-spin text-amber-400" /> : <span>Testar e Conectar Daily.co</span>}
              </button>
            </div>
          )}

          {/* AGORA.IO */}
          {platform === 'Agora.io' && (
            <div className="space-y-3 pt-2">
              <div>
                <label className="block text-slate-700 font-bold mb-1">App ID Agora.io</label>
                <input
                  type="text"
                  placeholder="agora_app_id_xxxxxxxxxxxxxxxx"
                  value={agoraAppId}
                  onChange={e => setAgoraAppId(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl py-2 px-3 text-slate-800"
                />
              </div>

              <div>
                <label className="block text-slate-700 font-bold mb-1">App Certificate (Opcional)</label>
                <input
                  type="password"
                  placeholder="agora_cert_xxxxxxxxxxxxxxxx"
                  value={agoraAppCert}
                  onChange={e => setAgoraAppCert(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl py-2 px-3 text-slate-800"
                />
              </div>

              <button
                type="button"
                disabled={loading}
                onClick={() => handleOAuthConnect('Agora.io')}
                className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-4 rounded-2xl shadow-md transition-all flex items-center justify-center space-x-2 cursor-pointer mt-2"
              >
                {loading ? <Loader2 className="h-5 w-5 animate-spin text-white" /> : <span>Testar e Conectar Agora.io</span>}
              </button>
            </div>
          )}

          {/* Security Guarantee Note */}
          <div className="pt-2 flex items-center justify-center space-x-1.5 text-[10px] text-slate-400">
            <Lock className="h-3 w-3 text-emerald-500" />
            <span>Todas as credenciais são salvas com criptografia AES-256 e salting por empresa.</span>
          </div>

          {/* Bottom Action Choices */}
          <div className="pt-4 border-t border-slate-200 flex flex-col sm:flex-row items-center justify-between gap-3">
            <button
              type="button"
              onClick={() => {
                onFallbackToGestRH();
                onClose();
              }}
              className="w-full sm:w-auto text-amber-700 hover:text-amber-800 font-extrabold bg-amber-50 hover:bg-amber-100 px-4 py-2.5 rounded-xl border border-amber-200 transition-all text-xs cursor-pointer text-center"
            >
              Usar GestRH Meeting (LiveKit)
            </button>

            <button
              type="button"
              onClick={onClose}
              className="w-full sm:w-auto text-slate-500 hover:text-slate-700 font-bold px-4 py-2.5 rounded-xl text-xs cursor-pointer text-center"
            >
              Cancelar
            </button>
          </div>

        </div>

      </div>
    </div>
  );
}
