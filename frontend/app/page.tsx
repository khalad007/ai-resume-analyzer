"use client";

import { useState } from "react";
import UploadForm from "@/components/ui/upload-form";
import HistoryList from "@/components/ui/history-list";

export default function Home() {
  const [refreshKey, setRefreshKey] = useState(0);

  return (
    <main className="flex flex-col items-center min-h-screen py-12 px-4">
      <UploadForm onAnalysisComplete={() => setRefreshKey((k) => k + 1)} />
      <HistoryList refreshKey={refreshKey} />
    </main>
  );
}