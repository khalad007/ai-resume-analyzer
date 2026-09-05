"use client";

import { useEffect, useState } from "react";

interface AnalysisRecord {
  id: number;
  input_text: string;
  result_text: string;
  created_at: string;
}

export default function HistoryList({ refreshKey }: { refreshKey: number }) {
  const [history, setHistory] = useState<AnalysisRecord[]>([]);
  const [initialLoading, setInitialLoading] = useState(true);
  const [openId, setOpenId] = useState<number | null>(null);

  useEffect(() => {
    const fetchHistory = async () => {
      try {
        const response = await fetch(
          `${process.env.NEXT_PUBLIC_API_URL}/history`,
        );
        if (!response.ok) throw new Error("Failed to fetch history");
        const data = await response.json();
        setHistory(data);
      } catch (error) {
        console.error(error);
      } finally {
        setInitialLoading(false);
      }
    };
    fetchHistory();
  }, [refreshKey]);

  return (
    <div className="w-full">
      <h2 className="font-serif text-lg text-ink mb-4">Past reviews</h2>

      {initialLoading && <p className="text-sm text-warmgray">Loading…</p>}

      {!initialLoading && history.length === 0 && (
        <p className="text-sm text-warmgray">
          Your reviewed resumes will appear here.
        </p>
      )}

      <div className="flex flex-col">
        {history.map((record, i) => (
          <div
            key={record.id}
            className={i > 0 ? "border-t border-warmgray/20" : ""}
          >
            <button
              onClick={() => setOpenId(openId === record.id ? null : record.id)}
              className="w-full text-left py-4 group"
            >
              <p className="text-xs text-warmgray mb-1">
                {new Date(record.created_at).toLocaleDateString(undefined, {
                  month: "short",
                  day: "numeric",
                  hour: "numeric",
                  minute: "2-digit",
                })}
              </p>
              <p className="text-sm text-ink line-clamp-1 group-hover:text-teal transition-colors">
                {record.input_text.slice(0, 60) || "Untitled review"}
              </p>
            </button>

            {openId === record.id && (
              <div className="pb-4 text-sm text-ink/80 whitespace-pre-wrap">
                {record.result_text}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
