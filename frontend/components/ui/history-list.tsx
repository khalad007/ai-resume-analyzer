"use client";

import { useEffect, useState } from "react";
import { Card } from "@/components/ui/card";

interface AnalysisRecord {
  id: number;
  input_text: string;
  result_text: string;
  created_at: string;
}

export default function HistoryList({ refreshKey }: { refreshKey: number }) {
const [history, setHistory] = useState<AnalysisRecord[]>([]);
const [initialLoading, setInitialLoading] = useState(true);

useEffect(() => {
  const fetchHistory = async () => {
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/history`);
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

if (initialLoading) return <p className="text-sm text-gray-500 mt-6">Loading history...</p>;
if (history.length === 0) return <p className="text-sm text-gray-500 mt-6">No past analyses yet.</p>;

  return (
    <div className="mt-8 w-full max-w-lg">
      <h2 className="text-lg font-semibold mb-3">Past Analyses</h2>
      <div className="space-y-3">
        {history.map((record) => (
          <Card key={record.id} className="p-4">
            <p className="text-xs text-gray-400 mb-2">
              {new Date(record.created_at).toLocaleString()}
            </p>
            <p className="text-sm text-gray-600 mb-2 line-clamp-2">
              {record.input_text}
            </p>
            <details className="text-sm">
              <summary className="cursor-pointer text-blue-600">View analysis</summary>
              <div className="mt-2 whitespace-pre-wrap">{record.result_text}</div>
            </details>
          </Card>
        ))}
      </div>
    </div>
  );
}