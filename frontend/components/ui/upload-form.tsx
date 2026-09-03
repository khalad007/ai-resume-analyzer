"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

export default function UploadForm() {
  const [file, setFile] = useState<File | null>(null);
  const [text, setText] = useState("");

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0]);
    }
  };

  const handleSubmit = () => {
    console.log("File:", file);
    console.log("Text:", text);
    // We'll connect this to the backend in a later step
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

      <Button onClick={handleSubmit} className="mt-4 w-full">
        Analyze
      </Button>
    </Card>
  );
}
