import { Component, type ReactNode } from 'react';

interface Props { children: ReactNode; onReset: () => void }
interface State { error: Error | null }

/** Catches a failed project load (unknown id, chunk fetch failure) and offers a way back. */
export class RouteErrorBoundary extends Component<Props, State> {
  state: State = { error: null };

  static getDerivedStateFromError(error: Error): State {
    return { error };
  }

  render() {
    if (!this.state.error) return this.props.children;
    return (
      <div className="h-full w-full flex flex-col items-center justify-center gap-4 bg-site-paper px-6 text-center">
        <p className="text-[11px] text-site-mid uppercase tracking-[0.25em]">
          Could not load that project
        </p>
        <button
          onClick={() => {
            this.setState({ error: null });
            this.props.onReset();
          }}
          className="text-[11px] uppercase tracking-[0.25em] underline text-site-ink cursor-pointer"
        >
          Back to gallery
        </button>
      </div>
    );
  }
}
