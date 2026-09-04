"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

export default function UploadForm() {
  const [file, setFile] = useState<File | null>(null);
  const [text, setText] = useState("");
  const [extractedText, setExtractedText] = useState("");
  const [loading, setLoading] = useState(false);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0]);
    }
  };

  const handleSubmit = async () => {
    if (!file) {
      alert("Please select a file first.");
      return;
    }

    setLoading(true);
    const formData = new FormData();
    formData.append("file", file);

    try {
      const response = await fetch("http://127.0.0.1:8000/extract-text", {
        method: "POST",
        body: formData,
      });

      if (!response.ok) {
        throw new Error("Failed to extract text");
      }

      const data = await response.json();
      setExtractedText(data.extracted_text);
    } catch (error) {
      console.error(error);
      alert("Something went wrong while extracting text.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card className="p-6 w-full max-w-lg">
      <Tabs defaultValue="upload">
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
            value={text}
            onChange={(e) => setText(e.target.value)}
            rows={8}
          />
        </TabsContent>
      </Tabs>

      <Button onClick={handleSubmit} className="mt-4 w-full" disabled={loading}>
        {loading ? "Analyzing..." : "Analyze"}
      </Button>

      {extractedText && (
        <div className="mt-4 p-3 bg-gray-100 rounded text-sm whitespace-pre-wrap max-h-60 overflow-y-auto">
          {extractedText}
        </div>
      )}
    </Card>
  );
}
