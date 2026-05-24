import React, { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { Link2, Copy, Check, Trash2, Download, Clock, FileText, Image, FileSpreadsheet, File } from "lucide-react";
import { format } from "date-fns";
import { toast } from "sonner";
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
  if (fileType.includes("sheet") || fileType.includes("csv") || fileType.includes("excel")) return FILE_ICONS.spreadsheet;
  return FILE_ICONS.default;
}

function formatBytes(bytes) {
  if (!bytes) return "—";
  if (bytes < 1024) return bytes + " B";
  if (bytes < 1048576) return (bytes / 1024).toFixed(1) + " KB";
  return (bytes / 1048576).toFixed(1) + " MB";
}

function isExpired(expiryDate) {
  if (!expiryDate) return false;
  return new Date(expiryDate) < new Date();
}

export default function FileCard({ file, onDelete, showOwner }) {
  const [copied, setCopied] = useState(false);
  const Icon = getFileIcon(file.file_type);
  const expired = isExpired(file.expiry_date);
  const shareUrl = `${window.location.origin}/shared/${file.share_id}`;

  const copyLink = () => {
    navigator.clipboard.writeText(shareUrl);
    setCopied(true);
    toast.success("Link copied to clipboard");
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -12 }}
      layout
    >
      <Card className="p-4 hover:shadow-md transition-shadow duration-300 group">
        <div className="flex items-start gap-3">
          <div className="h-11 w-11 rounded-xl bg-accent flex items-center justify-center shrink-0">
            <Icon className="h-5 w-5 text-accent-foreground" />
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-start justify-between gap-2">
              <div className="min-w-0">
                <p className="text-sm font-semibold truncate">{file.file_name}</p>
                <div className="flex items-center gap-2 mt-0.5 flex-wrap">
                  <span className="text-xs text-muted-foreground">{formatBytes(file.file_size)}</span>
                  <span className="text-xs text-muted-foreground">·</span>
                  <span className="text-xs text-muted-foreground flex items-center gap-1">
                    <Download className="h-3 w-3" /> {file.download_count || 0}
                  </span>
                  {showOwner && file.created_by && (
                    <>
                      <span className="text-xs text-muted-foreground">·</span>
                      <span className="text-xs text-muted-foreground">{file.created_by}</span>
                    </>
                  )}
                </div>
              </div>
              <div className="flex items-center gap-1 shrink-0">
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button variant="ghost" size="icon" className="h-8 w-8" onClick={copyLink}>
                        {copied ? <Check className="h-4 w-4 text-green-500" /> : <Copy className="h-4 w-4" />}
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent>Copy share link</TooltipContent>
                  </Tooltip>
                </TooltipProvider>
                {onDelete && (
                  <TooltipProvider>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground hover:text-destructive" onClick={() => onDelete(file)}>
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </TooltipTrigger>
                      <TooltipContent>Delete file</TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                )}
              </div>
            </div>
            <div className="flex items-center gap-2 mt-2">
              {expired ? (
                <Badge variant="destructive" className="text-xs gap-1">
                  <Clock className="h-3 w-3" /> Expired
                </Badge>
              ) : file.expiry_date ? (
                <Badge variant="secondary" className="text-xs gap-1">
                  <Clock className="h-3 w-3" /> Expires {format(new Date(file.expiry_date), "MMM d, yyyy h:mm a")}
                </Badge>
              ) : (
                <Badge variant="secondary" className="text-xs gap-1">
                  <Link2 className="h-3 w-3" /> No expiry
                </Badge>
              )}
            </div>
          </div>
        </div>
      </Card>
    </motion.div>
  );
}