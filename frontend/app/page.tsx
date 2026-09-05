"use client";

import { useState } from "react";
import UploadForm from "@/components/ui/upload-form";
import HistoryList from "@/components/ui/history-list";

export default function Home() {
  const [refreshKey, setRefreshKey] = useState(0);

  return (
    <main className="min-h-screen bg-paper">
      <div className="max-w-5xl mx-auto px-6 py-16 grid grid-cols-1 lg:grid-cols-[1fr_280px] gap-16">
        <UploadForm onAnalysisComplete={() => setRefreshKey((k) => k + 1)} />
        <HistoryList refreshKey={refreshKey} />
      </div>
    </main>
  );
}