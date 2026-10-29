"use client";

import { FormEvent, useEffect, useState } from "react";
import { api, Message } from "@/lib/api";

export function MessageThread({ matchId }: { matchId: string }) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [body, setBody] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);

  useEffect(() => {
    api.getMessages(matchId)
      .then(setMessages)
      .catch((err) => setError(err instanceof Error ? err.message : "خطا در بارگذاری پیام‌ها"))
      .finally(() => setLoading(false));
  }, [matchId]);

  async function submit(event: FormEvent) {
    event.preventDefault();
    if (!body.trim()) return;
    setSending(true);
    setError(null);
    try {
      const message = await api.sendMessage(matchId, body);
      setMessages((current) => [...current, message]);
      setBody("");
    } catch (err) {
      setError(err instanceof Error ? err.message : "خطا در ارسال پیام");
    } finally {
      setSending(false);
    }
  }

  return (
    <div className="mt-4 rounded-lg border border-gray-200 bg-gray-50 p-3">
      <h3 className="mb-2 text-sm font-semibold">گفت‌وگو درباره این تطابق</h3>
      {loading ? <p className="text-xs text-gray-500">در حال بارگذاری پیام‌ها...</p> : (
        <div className="mb-3 max-h-48 space-y-2 overflow-y-auto">
          {messages.length === 0 ? <p className="text-xs text-gray-500">هنوز پیامی ارسال نشده است.</p> : messages.map((message) => (
            <div key={message.id} className="rounded bg-white p-2 text-sm">
              <p className="text-xs text-gray-500">{message.sender.fullName}</p>
              <p>{message.body}</p>
            </div>
          ))}
        </div>
      )}
      <form onSubmit={submit} className="flex gap-2">
        <input value={body} onChange={(event) => setBody(event.target.value)} maxLength={2000} placeholder="پیام شما..." className="min-w-0 flex-1 rounded border border-gray-300 px-2 py-1.5 text-sm" />
        <button disabled={sending || !body.trim()} className="rounded bg-brand px-3 py-1.5 text-sm text-white disabled:opacity-50">ارسال</button>
      </form>
      {error && <p role="alert" className="mt-2 text-xs text-rose-600">{error}</p>}
    </div>
  );
}
