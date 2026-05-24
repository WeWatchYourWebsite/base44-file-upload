import React, { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import { base44 } from "@/api/base44Client";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Share2, Download, Clock, FileText, Image, FileSpreadsheet, File, AlertTriangle, Loader2 } from "lucide-react";
import { format } from "date-fns";
import { motion } from "framer-motion";

const FILE_ICONS = {
  image: Image,
  pdf: FileText,
  spreadsheet: FileSpreadsheet,
  default: File,
};

function getFileIcon(fileType) {
  if (!fileType) return FILE_ICONS.default;
  if (fileType.startsWith("image/")) return FILE_ICONS.image;
  if (fileType.includes("pdf")) return FILE_ICONS.pdf;
  if (fileType.includes("sheet") || fileType.includes("csv")) return FILE_ICONS.spreadsheet;
  return FILE_ICONS.default;
}

function formatBytes(bytes) {
  if (!bytes) return "";
  if (bytes < 1024) return bytes + " B";
  if (bytes < 1048576) return (bytes / 1024).toFixed(1) + " KB";
  return (bytes / 1048576).toFixed(1) + " MB";
}

export default function SharedFilePage() {
  const { shareId } = useParams();
  const [file, setFile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [expired, setExpired] = useState(false);

  useEffect(() => {
    const fetchFile = async () => {
      const files = await base44.entities.SharedFile.filter({ share_id: shareId });
      if (!files.length) {
        setError("not_found");
        setLoading(false);
        return;
      }
      const f = files[0];
      if (f.expiry_date && new Date(f.expiry_date) < new Date()) {
        setExpired(true);
        setFile(f);
        setLoading(false);
        return;
      }
      setFile(f);
      setLoading(false);
    };
    fetchFile();
  }, [shareId]);

  const handleDownload = async () => {
    if (!file) return;
    await base44.entities.SharedFile.update(file.id, {
      download_count: (file.download_count || 0) + 1,
    });
    window.open(file.file_url, "_blank");
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Loader2 className="h-8 w-8 text-primary animate-spin" />
      </div>
    );
  }

  if (error === "not_found") {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background p-4">
        <Card className="max-w-md w-full p-8 text-center">
          <div className="h-16 w-16 rounded-2xl bg-destructive/10 flex items-center justify-center mx-auto mb-4">
            <AlertTriangle className="h-8 w-8 text-destructive" />
          </div>
          <h2 className="text-xl font-bold">File not found</h2>
          <p className="text-sm text-muted-foreground mt-2">This link may be invalid or the file has been deleted.</p>
        </Card>
      </div>
    );
  }

  if (expired) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background p-4">
        <Card className="max-w-md w-full p-8 text-center">
          <div className="h-16 w-16 rounded-2xl bg-destructive/10 flex items-center justify-center mx-auto mb-4">
            <Clock className="h-8 w-8 text-destructive" />
          </div>
          <h2 className="text-xl font-bold">Link expired</h2>
          <p className="text-sm text-muted-foreground mt-2">
            This share link expired on {format(new Date(file.expiry_date), "MMM d, yyyy 'at' h:mm a")}.
          </p>
        </Card>
      </div>
    );
  }

  const Icon = getFileIcon(file.file_type);
  const isImage = file.file_type?.startsWith("image/");

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w-lg w-full"
      >
        <div className="text-center mb-6">
          <div className="flex items-center justify-center gap-2 mb-2">
            <div className="h-8 w-8 rounded-lg bg-primary flex items-center justify-center">
              <Share2 className="h-4 w-4 text-primary-foreground" />
            </div>
            <span className="text-lg font-bold tracking-tight">ShareDrop</span>
          </div>
          <p className="text-xs text-muted-foreground">Someone shared a file with you</p>
        </div>

        <Card className="p-6 space-y-5">
          {isImage && (
            <div className="rounded-xl overflow-hidden bg-muted">
              <img src={file.file_url} alt={file.file_name} className="w-full max-h-72 object-contain" />
            </div>
          )}

          <div className="flex items-start gap-3">
            <div className="h-12 w-12 rounded-xl bg-accent flex items-center justify-center shrink-0">
              <Icon className="h-6 w-6 text-accent-foreground" />
            </div>
            <div className="min-w-0">
              <p className="font-semibold truncate">{file.file_name}</p>
              <p className="text-xs text-muted-foreground mt-0.5">{formatBytes(file.file_size)}</p>
            </div>
          </div>

          {file.expiry_date && (
            <Badge variant="secondary" className="text-xs gap-1">
              <Clock className="h-3 w-3" />
              Expires {format(new Date(file.expiry_date), "MMM d, yyyy h:mm a")}
            </Badge>
          )}

          <Button onClick={handleDownload} className="w-full gap-2" size="lg">
            <Download className="h-5 w-5" />
            Download File
          </Button>
        </Card>
      </motion.div>
    </div>
  );
}