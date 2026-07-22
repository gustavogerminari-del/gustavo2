import React, { Component, ErrorInfo, ReactNode } from 'react';
import { AlertTriangle, RefreshCw } from 'lucide-react';

export interface ErrorBoundaryProps {
  children?: ReactNode;
}

export interface ErrorBoundaryState {
  hasError: boolean;
  error?: Error;
}

export class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  state: ErrorBoundaryState = {
    hasError: false
  };

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('Uncaught error in component:', error, errorInfo);
  }

  handleReset = () => {
    (this as unknown as { setState: (s: Partial<ErrorBoundaryState>) => void }).setState({ hasError: false, error: undefined });
    window.location.reload();
  };

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-slate-900 text-white flex items-center justify-center p-6">
          <div className="bg-slate-800/90 border border-slate-700/80 rounded-3xl p-8 max-w-md w-full text-center space-y-6 shadow-2xl backdrop-blur-md">
            <div className="mx-auto w-16 h-16 bg-amber-500/10 rounded-2xl border border-amber-500/20 flex items-center justify-center text-amber-400">
              <AlertTriangle className="w-8 h-8" />
            </div>
            <div>
              <h2 className="text-xl font-bold font-display text-white">Ops! Ocorreu um imprevisto</h2>
              <p className="text-xs text-slate-300 mt-2 leading-relaxed">
                Um erro inesperado aconteceu ao carregar este módulo. Clique no botão abaixo para recarregar com segurança.
              </p>
              {this.state.error?.message && (
                <div className="mt-3 p-3 bg-slate-950/60 rounded-xl text-[11px] text-amber-300 font-mono text-left overflow-x-auto max-h-24">
                  {this.state.error.message}
                </div>
              )}
            </div>
            <button
              onClick={this.handleReset}
              className="w-full bg-emerald-600 hover:bg-emerald-500 text-white font-bold py-3 px-4 rounded-2xl transition-all shadow-lg flex items-center justify-center space-x-2 cursor-pointer text-xs"
            >
              <RefreshCw className="w-4 h-4" />
              <span>Recarregar Aplicativo</span>
            </button>
          </div>
        </div>
      );
    }

    return (this as any).props.children;
  }
}

export default ErrorBoundary;
