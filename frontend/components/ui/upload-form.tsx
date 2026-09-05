"use client";

import { useState } from "react";
import ReactMarkdown from "react-markdown";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";

export default function UploadForm({
  onAnalysisComplete,
}: {
  onAnalysisComplete: () => void;
}) {
  const [activeTab, setActiveTab] = useState<"upload" | "paste">("upload");
  const [file, setFile] = useState<File | null>(null);
  const [pastedText, setPastedText] = useState("");
  const [analysis, setAnalysis] = useState("");
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0]);
    }
  };

  const analyzeText = async (text: string) => {
    const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/analyze`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ text }),
    });
    if (!response.ok) throw new Error("Analysis failed");
    const data = await response.json();
    return data.analysis;
  };

  const handleSubmit = async () => {
    setLoading(true);
    setAnalysis("");
    setErrorMsg("");

    try {
      let textToAnalyze = "";

      if (activeTab === "upload") {
        if (!file) {
          setErrorMsg("Choose a file before analyzing.");
          setLoading(false);
          return;
        }
        const formData = new FormData();
        formData.append("file", file);
        const extractResponse = await fetch(
          `${process.env.NEXT_PUBLIC_API_URL}/extract-text`,
          {
            method: "POST",
            body: formData,
          },
        );
        if (!extractResponse.ok) throw new Error("Text extraction failed");
        const extractData = await extractResponse.json();
        textToAnalyze = extractData.extracted_text;
      } else {
        if (!pastedText.trim()) {
          setErrorMsg("Paste some text before analyzing.");
          setLoading(false);
          return;
        }
        textToAnalyze = pastedText;
      }

      const result = await analyzeText(textToAnalyze);
      setAnalysis(result);
      onAnalysisComplete();
    } catch (error) {
      console.error(error);
      setErrorMsg("Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full">
      <h1 className="font-serif text-3xl text-ink mb-1">AI Resume Analyzer</h1>
      <p className="text-warmgray text-sm mb-8">
        Upload a resume or paste text to get an honest, structured review.
      </p>

      {/* Tabs */}
      <div className="flex gap-6 border-b border-warmgray/30 mb-6">
        <button
          onClick={() => setActiveTab("upload")}
          className={`pb-3 text-sm transition-colors ${
            activeTab === "upload"
              ? "text-ink border-b-2 border-ink font-medium"
              : "text-warmgray hover:text-ink"
          }`}
        >
          Upload file
        </button>
        <button
          onClick={() => setActiveTab("paste")}
          className={`pb-3 text-sm transition-colors ${
            activeTab === "paste"
              ? "text-ink border-b-2 border-ink font-medium"
              : "text-warmgray hover:text-ink"
          }`}
        >
          Paste text
        </button>
      </div>

      {/* Input area */}
      {activeTab === "upload" ? (
        <label className="flex flex-col items-center justify-center gap-2 border border-dashed border-warmgray/40 rounded-md py-10 px-4 cursor-pointer hover:border-ink/40 transition-colors bg-white">
          <input
            type="file"
            accept=".pdf,.docx"
            onChange={handleFileChange}
            className="hidden"
          />
          <span className="text-sm text-ink">
            {file ? file.name : "Click to choose a PDF or DOCX file"}
          </span>
          {!file && (
            <span className="text-xs text-warmgray">or drag and drop</span>
          )}
        </label>
      ) : (
        <Textarea
          placeholder="Paste your resume or content here…"
          value={pastedText}
          onChange={(e) => setPastedText(e.target.value)}
          rows={10}
          className="bg-white border-warmgray/30 focus-visible:ring-ink/20"
        />
      )}

      <Button
        onClick={handleSubmit}
        disabled={loading}
        className="mt-5 bg-ink hover:bg-ink/90 text-paper"
      >
        {loading ? "Analyzing…" : "Analyze"}
      </Button>

      {errorMsg && <p className="mt-3 text-sm text-clay">{errorMsg}</p>}

      {analysis && (
        <div className="mt-8 pt-8 border-t border-warmgray/20">
          <article className="prose prose-sm max-w-none font-serif text-ink prose-headings:font-serif prose-headings:text-ink prose-strong:text-ink">
            <ReactMarkdown>{analysis}</ReactMarkdown>
          </article>
        </div>
      )}
    </div>
  );
}
