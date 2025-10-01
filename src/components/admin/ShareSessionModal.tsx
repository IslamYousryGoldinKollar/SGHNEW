"use client";

import { useState, useRef, useEffect } from "react";
import type { Game } from "@/lib/types";
import { db, storage } from "@/lib/firebase";
import { doc, updateDoc } from "firebase/firestore";
import { ref, uploadBytes, getDownloadURL, deleteObject } from "firebase/storage";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Loader2, Copy, Upload, Trash2, Link as LinkIcon } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import Image from "next/image";

interface ShareSessionModalProps {
  session: Game | null;
  onClose: () => void;
}

export default function ShareSessionModal({ session, onClose }: ShareSessionModalProps) {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [thumbnailUrl, setThumbnailUrl] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();

  const joinUrl = session ? `${window.location.origin}/game/${session.id}` : "";

  useEffect(() => {
    if (session) {
      setTitle(session.title || "Trivia Titans");
      setDescription(session.description || "");
      setThumbnailUrl(session.thumbnailUrl || null);
    }
  }, [session]);

  if (!session) return null;

  const handleSave = async () => {
    setIsSaving(true);
    try {
      const gameRef = doc(db, "games", session.id);
      await updateDoc(gameRef, {
        title,
        description,
        thumbnailUrl
      });
      toast({ title: "Success", description: "Share settings updated." });
      onClose();
    } catch (error) {
      console.error("Error saving share settings:", error);
      toast({ title: "Error", description: "Could not save settings.", variant: "destructive" });
    } finally {
      setIsSaving(false);
    }
  };

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setIsUploading(true);
    try {
      // If there's an old thumbnail, delete it first
      if (session.thumbnailUrl) {
          try {
              // Firebase storage URLs can be in two formats:
              // 1. gs://<bucket>/<path-to-file>
              // 2. https://firebasestorage.googleapis.com/v0/b/<bucket>/o/<path-to-file>?alt=media&token=<token>
              // We need to extract the path to the file.
              const filePath = decodeURIComponent(session.thumbnailUrl.split('/o/')[1].split('?')[0]);
              const oldImageRef = ref(storage, filePath);
              await deleteObject(oldImageRef);
          } catch (deleteError: any) {
              // It's okay if the old file doesn't exist.
              if (deleteError.code !== 'storage/object-not-found') {
                  console.warn("Could not delete old thumbnail:", deleteError);
              }
          }
      }

      const imageRef = ref(storage, `game-thumbnails/${session.id}/${file.name}`);
      const snapshot = await uploadBytes(imageRef, file);
      const downloadURL = await getDownloadURL(snapshot.ref);
      setThumbnailUrl(downloadURL);
      toast({ title: "Thumbnail uploaded!", description: "Save your changes to apply." });
    } catch (error) {
      console.error("Error uploading thumbnail:", error);
      toast({ title: "Upload Failed", description: "Could not upload the image.", variant: "destructive" });
    } finally {
      setIsUploading(false);
    }
  };

  const handleRemoveThumbnail = async () => {
     if (!thumbnailUrl) return;
     setThumbnailUrl(null);
     toast({ title: "Thumbnail removed", description: "Save your changes to apply." });
  }

  const handleCopyUrl = () => {
    navigator.clipboard.writeText(joinUrl).then(() => {
        toast({ title: "URL Copied!", description: "The join link is on your clipboard." });
    }).catch(err => {
        console.error("Clipboard error:", err);
        toast({ title: "Copy Failed", description: "Could not copy URL. Please copy it manually.", variant: "destructive"});
    });
  }

  return (
    <Dialog open={!!session} onOpenChange={(isOpen) => !isOpen && onClose()}>
      <DialogContent className="sm:max-w-[600px] grid-rows-[auto_1fr_auto]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2"><LinkIcon /> Share Session</DialogTitle>
          <DialogDescription>
            Edit the metadata for your session link. Changes will be reflected when the link is shared.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6 py-4 overflow-y-auto max-h-[60vh] pr-2">
            <Card>
                <CardHeader>
                    <CardTitle>Link Details</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="space-y-2">
                        <Label htmlFor="title">Title</Label>
                        <Input id="title" value={title} onChange={(e) => setTitle(e.target.value)} />
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="description">Description (for social sharing)</Label>
                        <Textarea id="description" value={description} onChange={(e) => setDescription(e.target.value)} placeholder="A fun trivia game for the whole team!"/>
                    </div>
                </CardContent>
            </Card>

            <Card>
                <CardHeader>
                    <CardTitle>Thumbnail Image</CardTitle>
                    <CardDescription>This image will be shown when you share the link on social media.</CardDescription>
                </CardHeader>
                 <CardContent>
                    {thumbnailUrl ? (
                        <div className="space-y-4">
                             <div className="relative aspect-video w-full overflow-hidden rounded-md border">
                                <Image src={thumbnailUrl} alt="Session thumbnail" fill className="object-cover"/>
                            </div>
                            <Button variant="destructive" onClick={handleRemoveThumbnail} className="w-full">
                                <Trash2 className="mr-2"/> Remove Thumbnail
                            </Button>
                        </div>
                    ) : (
                        <div className="flex flex-col items-center justify-center border-2 border-dashed rounded-lg p-8 text-center">
                            <p className="text-muted-foreground mb-4">No thumbnail set.</p>
                            <Button type="button" onClick={() => fileInputRef.current?.click()} disabled={isUploading}>
                                {isUploading ? <Loader2 className="mr-2 animate-spin" /> : <Upload className="mr-2" />}
                                Upload Image
                            </Button>
                             <input type="file" ref={fileInputRef} onChange={handleFileUpload} accept="image/*" className="hidden" />
                        </div>
                    )}
                </CardContent>
            </Card>
            
             <Card>
                <CardHeader>
                    <CardTitle>Session URL</CardTitle>
                    <CardDescription>Share this link with your players.</CardDescription>
                </CardHeader>
                <CardContent className="flex items-center gap-2">
                    <Input value={joinUrl} readOnly className="font-mono bg-muted"/>
                    <Button variant="outline" size="icon" onClick={handleCopyUrl}>
                        <Copy />
                        <span className="sr-only">Copy URL</span>
                    </Button>
                </CardContent>
            </Card>

        </div>

        <DialogFooter>
          <Button variant="ghost" onClick={onClose}>Cancel</Button>
          <Button onClick={handleSave} disabled={isSaving || isUploading}>
            {isSaving && <Loader2 className="mr-2 animate-spin" />}
            Save Changes
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
