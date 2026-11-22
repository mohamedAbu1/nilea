"use client";

import { useState } from "react";
import type { ChatMessage } from "../lib/chat";

function formatSize(value: number | null) {
  if (!value) return "";
  if (value < 1024 * 1024) return `${Math.max(1, Math.round(value / 1024))} KB`;
  return `${(value / (1024 * 1024)).toFixed(1)} MB`;
}

export default function ChatAttachment({ message, imageClassName, fileClassName }: {
  message: ChatMessage;
  imageClassName: string;
  fileClassName: string;
}) {
  const [imageFailed, setImageFailed] = useState(false);
  if (!message.attachment_url) return null;
  const fileLabel = message.attachment_name || "Shared file";

  if (message.message_type === "image" && !imageFailed) {
    return <a href={message.attachment_url} target="_blank" rel="noreferrer">
      <img className={imageClassName} src={message.attachment_url} alt={fileLabel} onError={() => setImageFailed(true)} />
    </a>;
  }

  return <a className={fileClassName} href={message.attachment_url} target="_blank" rel="noreferrer">
    <span>▣</span><span><strong>{fileLabel}</strong><small>{formatSize(message.attachment_size)}</small></span>
  </a>;
}
