import React from "react";
import { base44 } from "@/api/base44Client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { AnimatePresence } from "framer-motion";
import { FileX } from "lucide-react";
import FileUploader from "@/components/files/FileUploader";
import FileCard from "@/components/files/FileCard";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

export default function Dashboard() {
  const [deleteTarget, setDeleteTarget] = React.useState(null);
  const queryClient = useQueryClient();

  const { data: files = [], isLoading } = useQuery({
    queryKey: ["my-files"],
    queryFn: () => base44.entities.SharedFile.list("-created_date"),
  });

  const deleteMutation = useMutation({
    mutationFn: (id) => base44.entities.SharedFile.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["my-files"] });
      setDeleteTarget(null);
    },
  });

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">My Files</h1>
        <p className="text-sm text-muted-foreground mt-1">Upload and share files with anyone via a link</p>
      </div>

      <FileUploader onUploadComplete={() => queryClient.invalidateQueries({ queryKey: ["my-files"] })} />

      <div className="space-y-3">
        {isLoading ? (
          <div className="flex justify-center py-16">
            <div className="w-6 h-6 border-2 border-primary/30 border-t-primary rounded-full animate-spin" />
          </div>
        ) : files.length === 0 ? (
          <div className="text-center py-16">
            <div className="h-16 w-16 rounded-2xl bg-muted flex items-center justify-center mx-auto mb-4">
              <FileX className="h-8 w-8 text-muted-foreground" />
            </div>
            <p className="text-sm font-medium text-muted-foreground">No files uploaded yet</p>
            <p className="text-xs text-muted-foreground mt-1">Upload your first file to get a shareable link</p>
          </div>
        ) : (
          <AnimatePresence>
            {files.map((file) => (
              <FileCard key={file.id} file={file} onDelete={setDeleteTarget} />
            ))}
          </AnimatePresence>
        )}
      </div>

      <AlertDialog open={!!deleteTarget} onOpenChange={() => setDeleteTarget(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete file?</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently delete "{deleteTarget?.file_name}" and its share link.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              onClick={() => deleteMutation.mutate(deleteTarget.id)}
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}