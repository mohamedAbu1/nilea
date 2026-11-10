import Link from "next/link";

type StatusSceneProps = {
  code: string;
  eyebrow: string;
  title: string;
  description: string;
  actionLabel: string;
  actionHref?: string;
  onAction?: () => void;
  secondaryLabel?: string;
  secondaryHref?: string;
};

export function StatusScene({ code, eyebrow, title, description, actionLabel, actionHref = "/", onAction, secondaryLabel, secondaryHref = "/destinations" }: StatusSceneProps) {
  return (
    <main className="status-page">
      <div className="status-scene" aria-hidden="true">
        <div className="status-orbit status-orbit-one" />
        <div className="status-orbit status-orbit-two" />
        <div className="status-pyramid"><span className="status-pyramid-face status-pyramid-front" /><span className="status-pyramid-face status-pyramid-side" /><span className="status-pyramid-glow" /></div>
        <div className="status-sun">{code}</div>
      </div>
      <div className="status-copy">
        <p className="status-eyebrow">{eyebrow}</p>
        <h1>{title}</h1>
        <p className="status-description">{description}</p>
        <div className="status-actions">
          {onAction ? <button type="button" className="status-primary-action" onClick={onAction}>{actionLabel} <span aria-hidden="true">↗</span></button> : <Link href={actionHref} className="status-primary-action">{actionLabel} <span aria-hidden="true">↗</span></Link>}
          {secondaryLabel && <Link href={secondaryHref} className="status-secondary-action">{secondaryLabel}</Link>}
        </div>
      </div>
    </main>
  );
}

export function LoadingScene() {
  return (
    <main className="status-page loading-page" aria-live="polite" aria-busy="true">
      <div className="status-scene loading-scene" aria-hidden="true">
        <div className="status-orbit status-orbit-one" />
        <div className="status-orbit status-orbit-two" />
        <div className="status-pyramid"><span className="status-pyramid-face status-pyramid-front" /><span className="status-pyramid-face status-pyramid-side" /><span className="status-pyramid-glow" /></div>
        <div className="loading-spark">✦</div>
      </div>
      <div className="status-copy loading-copy">
        <p className="status-eyebrow">ALPNILE / NILE ARCHIVES</p>
        <h1>Preparing your next chapter</h1>
        <p className="status-description">The river is unfolding. Your journey will be ready in a moment.</p>
        <div className="loading-progress"><span /></div>
      </div>
    </main>
  );
}
