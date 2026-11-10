"use client";

import { StatusScene } from "./components/status-scene";

export default function GlobalError({ reset }: { error: Error & { digest?: string }; reset: () => void }) {
  return (
    <html lang="en">
      <body>
        <StatusScene code="500" eyebrow="ALPNILE / ARCHIVE ERROR" title="The archive needs a moment." description="A core page layer could not load. Try again, then return to the river when the scene is ready." actionLabel="Reload chapter" onAction={reset} secondaryLabel="Open AlpNile" secondaryHref="/" />
      </body>
    </html>
  );
}
