import React, { useState, useRef } from "react";
import { base44 } from "@/api/base44Client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Upload, Loader2, FileUp } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

export default function FileUploader({ onUploadComplete }) {
  const [isDragging, setIsDragging] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [expiryDate, setExpiryDate] = useState("");
  const fileInputRef = useRef(null);

  const generateShareId = () => {
    return Math.random().toString(36).substring(2, 10) + Date.now().toString(36);
  };

  const handleFiles = async (files) => {
    if (!files.length) return;
    setUploading(true);

    for (const file of files) {
      const { file_url } = await base44.integrations.Core.UploadFile({ file });
      const shareId = generateShareId();

      const fileData = {
        file_name: file.name,
        file_url,
        file_type: file.type,
        file_size: file.size,
        share_id: shareId,
        download_count: 0,
      };

      if (expiryDate) {
        fileData.expiry_date = new Date(expiryDate).toISOString();
      }

      await base44.entities.SharedFile.create(fileData);
    }

    setUploading(false);
    setExpiryDate("");
    if (fileInputRef.current) fileInputRef.current.value = "";
    onUploadComplete?.();
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragging(false);
    handleFiles(Array.from(e.dataTransfer.files));
  };

  return (
    <div className="space-y-4">
      <div
        onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
        onDragLeave={() => setIsDragging(false)}
        onDrop={handleDrop}
        onClick={() => !uploading && fileInputRef.current?.click()}
        className={`
          relative cursor-pointer rounded-2xl border-2 border-dashed p-10 text-center transition-all duration-300
          ${isDragging ? "border-primary bg-accent scale-[1.01]" : "border-border hover:border-primary/40 hover:bg-accent/50"}
          ${uploading ? "pointer-events-none opacity-60" : ""}
        `}
      >
        <input
          ref={fileInputRef}
          type="file"
          multiple
          className="hidden"
          onChange={(e) => handleFiles(Array.from(e.target.files))}
          accept="image/*,.pdf,.doc,.docx,.txt,.xlsx,.pptx,.zip,.csv"
        />
        <AnimatePresence mode="wait">
          {uploading ? (
            <motion.div key="uploading" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="flex flex-col items-center gap-3">
              <Loader2 className="h-10 w-10 text-primary animate-spin" />
              <p className="text-sm font-medium text-muted-foreground">Uploading your files...</p>
            </motion.div>
          ) : (
            <motion.div key="idle" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="flex flex-col items-center gap-3">
              <div className="h-14 w-14 rounded-2xl bg-primary/10 flex items-center justify-center">
                <FileUp className="h-7 w-7 text-primary" />
              </div>
              <div>
                <p className="text-sm font-semibold text-foreground">Drop files here or click to browse</p>
                <p className="text-xs text-muted-foreground mt-1">Images, PDFs, documents up to 50MB</p>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      <div className="flex items-end gap-3">
        <div className="flex-1">
          <Label htmlFor="expiry" className="text-xs font-medium text-muted-foreground mb-1.5 block">
            Link expiry (optional)
          </Label>
          <Input
            id="expiry"
            type="datetime-local"
            value={expiryDate}
            onChange={(e) => setExpiryDate(e.target.value)}
            min={new Date().toISOString().slice(0, 16)}
            className="bg-card"
          />
        </div>
        <Button
          onClick={() => fileInputRef.current?.click()}
          disabled={uploading}
          className="gap-2"
        >
          <Upload className="h-4 w-4" />
          Upload
        </Button>
      </div>
    </div>
  );
}