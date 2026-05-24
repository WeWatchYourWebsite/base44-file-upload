import React, { useState } from "react";
import { base44 } from "@/api/base44Client";
import { useAuth } from "@/lib/AuthContext";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { AnimatePresence } from "framer-motion";
import { Input } from "@/components/ui/input";
import { Shield, Search, FileX } from "lucide-react";
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
import { Navigate } from "react-router-dom";

export default function Admin() {
  const { user } = useAuth();
  const [search, setSearch] = useState("");
  const [deleteTarget, setDeleteTarget] = useState(null);
  const queryClient = useQueryClient();

  const { data: files = [], isLoading } = useQuery({
    queryKey: ["admin-files"],
    queryFn: () => base44.entities.SharedFile.list("-created_date", 200),
  });

  const deleteMutation = useMutation({
    mutationFn: (id) => base44.entities.SharedFile.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-files"] });
      setDeleteTarget(null);
    },
  });

  if (user?.role !== "admin") {
    return <Navigate to="/" replace />;
  }

  const filteredFiles = files.filter((f) => {
    const q = search.toLowerCase();
    return (
      f.file_name?.toLowerCase().includes(q) ||
      f.created_by?.toLowerCase().includes(q)
    );
  });

  return (
    <div className="space-y-8">
      <div className="flex items-center gap-3">
        <div className="h-10 w-10 rounded-xl bg-accent flex items-center justify-center">
          <Shield className="h-5 w-5 text-accent-foreground" />
        </div>
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Admin Panel</h1>
          <p className="text-sm text-muted-foreground">Manage all uploaded files across users</p>
        </div>
      </div>

      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Search by file name or email..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="pl-10 bg-card"
        />
      </div>

      <div className="space-y-3">
        {isLoading ? (
          <div className="flex justify-center py-16">
            <div className="w-6 h-6 border-2 border-primary/30 border-t-primary rounded-full animate-spin" />
          </div>
        ) : filteredFiles.length === 0 ? (
          <div className="text-center py-16">
            <div className="h-16 w-16 rounded-2xl bg-muted flex items-center justify-center mx-auto mb-4">
              <FileX className="h-8 w-8 text-muted-foreground" />
            </div>
            <p className="text-sm font-medium text-muted-foreground">No files found</p>
          </div>
        ) : (
          <>
            <p className="text-xs text-muted-foreground">{filteredFiles.length} files total</p>
            <AnimatePresence>
              {filteredFiles.map((file) => (
                <FileCard key={file.id} file={file} onDelete={setDeleteTarget} showOwner />
              ))}
            </AnimatePresence>
          </>
        )}
      </div>

      <AlertDialog open={!!deleteTarget} onOpenChange={() => setDeleteTarget(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete file?</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently delete "{deleteTarget?.file_name}" uploaded by {deleteTarget?.created_by}.
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