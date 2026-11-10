"use client";

import { StatusScene } from "./components/status-scene";

export default function Error({ reset }: { error: Error & { digest?: string }; reset: () => void }) {
  return <StatusScene code="500" eyebrow="ALPNILE / SOMETHING WENT OFF-ROUTE" title="The river took an unexpected turn." description="This chapter could not be opened right now. Try the route again, or return to the archives and continue exploring." actionLabel="Try again" onAction={reset} secondaryLabel="Back to destinations" secondaryHref="/destinations" />;
}
