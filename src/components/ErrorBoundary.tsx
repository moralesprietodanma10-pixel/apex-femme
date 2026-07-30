import { Component, ErrorInfo, ReactNode } from 'react';
import { AlertTriangle, RefreshCw } from 'lucide-react';

export interface ErrorBoundaryProps {
  children: ReactNode;
  fallback?: ReactNode;
}

export interface ErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
}

export class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
    };
  }

  public static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { hasError: true, error };
  }

  public override componentDidCatch(error: Error, errorInfo: ErrorInfo): void {
    console.error('APEX FEMME - Error no capturado:', error, errorInfo);
  }

  private handleReset = (): void => {
    this.setState({ hasError: false, error: null });
    window.location.reload();
  };

  public override render(): ReactNode {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback;
      }

      return (
        <div className="min-h-[400px] flex items-center justify-center p-6 text-center animate-fade-in">
          <div className="max-w-md w-full glass-card p-8 rounded-3xl border border-rose-500/40 shadow-2xl space-y-4">
            <div className="w-14 h-14 bg-rose-500/10 text-rose-500 rounded-2xl flex items-center justify-center mx-auto border border-rose-500/30">
              <AlertTriangle className="w-7 h-7" />
            </div>

            <div className="space-y-1">
              <h2 className="text-xl font-extrabold text-[var(--text-main)]">
                Algo no salió como esperábamos
              </h2>
              <p className="text-xs text-[var(--text-muted)] leading-relaxed">
                Hemos aislado la excepción para proteger tus datos de rendimiento. Haz clic abajo para recargar la aplicación limpiamente.
              </p>
            </div>

            {this.state.error && (
              <div className="bg-[var(--bg-input)] p-3 rounded-xl border border-[var(--border-subtle)] text-[10px] font-mono text-rose-400 text-left overflow-x-auto max-h-24">
                {this.state.error.message}
              </div>
            )}

            <button
              onClick={this.handleReset}
              className="w-full theme-accent-bg px-4 py-3 rounded-2xl font-extrabold text-xs uppercase tracking-wider flex items-center justify-center gap-2 active:scale-95 transition-transform"
            >
              <RefreshCw className="w-4 h-4" />
              Recargar Plataforma
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
