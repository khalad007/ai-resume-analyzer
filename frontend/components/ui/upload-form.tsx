"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

export default function UploadForm({ onAnalysisComplete }: { onAnalysisComplete: () => void }) {
  const [file, setFile] = useState<File | null>(null);
  const [pastedText, setPastedText] = useState("");
  const [activeTab, setActiveTab] = useState("upload");
  const [analysis, setAnalysis] = useState("");
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0]);
    }
  };

  const analyzeText = async (text: string) => {
    const response = await fetch("${process.env.NEXT_PUBLIC_API_URL}/analyze", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ text }),
    });

    if (!response.ok) {
      throw new Error("Analysis failed");
    }

    const data = await response.json();
    return data.analysis;
  };

  const handleSubmit = async () => {
    setLoading(true);
    setAnalysis("");
    onAnalysisComplete();
    setErrorMsg("");

    try {
      let textToAnalyze = "";

      if (activeTab === "upload") {
        if (!file) {
          alert("Please select a file first.");
          setLoading(false);
          return;
        }

        const formData = new FormData();
        formData.append("file", file);

        const extractResponse = await fetch(
          "${process.env.NEXT_PUBLIC_API_URL}/extract-text",
          {
            method: "POST",
            body: formData,
          },
        );

        if (!extractResponse.ok) {
          throw new Error("Text extraction failed");
        }

        const extractData = await extractResponse.json();
        textToAnalyze = extractData.extracted_text;
      } else {
        if (!pastedText.trim()) {
          alert("Please paste some text first.");
          setLoading(false);
          return;
        }
        textToAnalyze = pastedText;
      }

      const result = await analyzeText(textToAnalyze);
      setAnalysis(result);
    } catch (error) {
      console.error(error);
      setErrorMsg("Something went wrong. Check the console for details.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card className="p-6 w-full max-w-lg">
      <Tabs
        defaultValue="upload"
        onValueChange={(value) => setActiveTab(value)}
      >
        <TabsList className="mb-4">
          <TabsTrigger value="upload">Upload File</TabsTrigger>
          <TabsTrigger value="paste">Paste Text</TabsTrigger>
        </TabsList>

        <TabsContent value="upload">
          <input
            type="file"
            accept=".pdf,.docx"
            onChange={handleFileChange}
            className="mb-4 block"
          />
          {file && (
            <p className="text-sm text-gray-500">Selected: {file.name}</p>
          )}
        </TabsContent>

        <TabsContent value="paste">
          <Textarea
            placeholder="Paste your resume or content here..."
            value={pastedText}
            onChange={(e) => setPastedText(e.target.value)}
            rows={8}
          />
        </TabsContent>
      </Tabs>

      <Button onClick={handleSubmit} className="mt-4 w-full" disabled={loading}>
        {loading ? "Analyzing..." : "Analyze"}
      </Button>

      {errorMsg && <p className="mt-4 text-sm text-red-600">{errorMsg}</p>}

      {analysis && (
        <div className="mt-4 p-4 bg-gray-100 rounded text-sm whitespace-pre-wrap max-h-96 overflow-y-auto">
          {analysis}
        </div>
      )}
    </Card>
  );
}
