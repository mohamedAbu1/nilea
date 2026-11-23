"use client";

import { useState } from "react";
import type { ChatMessage } from "../lib/chat";

function formatSize(value: number | null) {
  if (!value) return "";
  if (value < 1024 * 1024) return `${Math.max(1, Math.round(value / 1024))} KB`;
  return `${(value / (1024 * 1024)).toFixed(1)} MB`;
}

function isImageAttachment(message: ChatMessage) {
  const mime = message.attachment_mime?.toLowerCase() ?? "";
  const path = message.attachment_path?.toLowerCase() ?? "";
  return message.message_type === "image" || mime.startsWith("image/") || /\.(avif|gif|heic|heif|jpe?g|png|webp)(?:$|[?#])/.test(path);
}

export default function ChatAttachment({ message, imageClassName, fileClassName }: {
  message: ChatMessage;
  imageClassName: string;
  fileClassName: string;
}) {
  const [imageFailed, setImageFailed] = useState(false);
  if (!message.attachment_url) return null;
  const fileLabel = message.attachment_name || "Shared file";

  if (isImageAttachment(message)) {
    if (imageFailed) {
      return <div className={`${imageClassName} chat-image-unavailable`} role="img" aria-label={`${fileLabel} could not be loaded`}><span>Image unavailable</span><small>{fileLabel}</small></div>;
    }
    return <a className="chat-attachment-image-link" href={message.attachment_url} target="_blank" rel="noreferrer">
      <img className={imageClassName} src={message.attachment_url} alt={fileLabel} loading="lazy" decoding="async" onError={() => setImageFailed(true)} />
    </a>;
  }

  return <a className={fileClassName} href={message.attachment_url} target="_blank" rel="noreferrer">
    <span>▣</span><span><strong>{fileLabel}</strong><small>{formatSize(message.attachment_size)}</small></span>
  </a>;
}
