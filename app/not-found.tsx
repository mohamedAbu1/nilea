import { StatusScene } from "./components/status-scene";

export default function NotFound() {
  return <StatusScene code="404" eyebrow="ALPNILE / LOST CHAPTER" title="This chapter is not on the map." description="The page you are looking for has drifted beyond this route. Let us guide you back to an unforgettable place." actionLabel="Explore destinations" actionHref="/destinations" secondaryLabel="Return home" secondaryHref="/" />;
}
