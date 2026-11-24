"use client";

import dynamic from "next/dynamic";
import { useState } from "react";
import Image from "next/image";

const ChatWidget = dynamic(() => import("./chat-widget"), { ssr: false });

export default function DeferredChatWidget() {
  const [loaded, setLoaded] = useState(false);

  if (loaded) return <ChatWidget initialOpen hideLauncher />;

  return (
    <div className="alpnile-chat-shell">
      <button className="alpnile-chat-launcher" type="button" onClick={() => setLoaded(true)} aria-expanded={false} aria-label="Open support chat — Chat with AlpNile">
        <span className="alpnile-chat-launcher-mark"><Image src="/chat/alpnile-chat-3d.webp" alt="" width={64} height={64} sizes="38px" /></span>
        <span><strong>Need a hand?</strong><small>Chat with AlpNile</small></span>
        <b aria-hidden="true">↗</b>
      </button>
    </div>
  );
}
