
import React, { useState, useEffect, useRef } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { FileImage, Trash2, Pencil, FileX, FilePlus, FileText } from "lucide-react";
import { showSuccess, showError } from "@/services/notification";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";

interface FileAttachment {
    id: string;
    name: string;
    size: number;
    unit: 'GB' | 'MB' | 'KB' | 'Bytes'; // <- add this
    type: string;
    lastModified: number;
    content?: string;
    createdAt: string;
}
interface DealAttachmentsWidgetProps {
    dealId: string;
    disabled?: boolean;
    handleFileUpload: (e: React.ChangeEvent<HTMLInputElement>) => void;
    fileInputRef: React.RefObject<HTMLInputElement>;
    isUploading: boolean;
    setAttachments: React.Dispatch<React.SetStateAction<FileAttachment[]>>;
    attachments: FileAttachment[];
    dataDeal;
    handleDeleteFile;
    setFileToDelete;
    fileToDelete;
    confirmDeleteFile
}

export const DealAttachmentsWidget = ({ 
    dealId, 
    disabled = false,
    handleFileUpload,
    fileInputRef,
    isUploading,
    setAttachments,
    attachments,
    dataDeal,
    handleDeleteFile,
    setFileToDelete,
    fileToDelete,
    confirmDeleteFile

}: DealAttachmentsWidgetProps) => {
    // const [fileToDelete, setFileToDelete] = useState<string | null>(null);
    const [editingFileId, setEditingFileId] = useState<string | null>(null);
    const [editingFileName, setEditingFileName] = useState("");

    useEffect(() => {
        const currentDeal = dataDeal.find(d => Number(d.id) === Number(dealId));
        if (currentDeal) {
            const mappedAttachments: FileAttachment[] = currentDeal.deal_attachments.map((file: any) => ({
                id: file.id.toString(),
                name: file.file_name || "Untitled",
                size: parseFloat(file.file_size || "0"), 
                unit: file.file_size_unit || 'Bytes', // store unit
                type: file.file_type || "application/octet-stream",
            }));
            setAttachments(mappedAttachments);
        }
    }, [dealId, dataDeal, setAttachments]);

    const convertToBytes = (size: number, unit: 'GB' | 'MB' | 'KB' | 'Bytes'): number => {
        switch (unit) {
            case 'GB': return size * 1024 * 1024 * 1024;
            case 'MB': return size * 1024 * 1024;
            case 'KB': return size * 1024;
            case 'Bytes':
            default: return size;
        }
    };

    const formatFileSize = (size: number, unit: 'GB' | 'MB' | 'KB' | 'Bytes' = 'Bytes'): string => {
        const bytes = convertToBytes(size, unit);
        if (bytes === 0) return '0 Bytes';

        const k = 1024;
        const sizes = ['Bytes', 'KB', 'MB', 'GB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return (bytes / Math.pow(k, i)).toFixed(2) + ' ' + sizes[i];
    };

    // Save edited file name
    const saveFileName = (fileId: string) => {
        if (editingFileName.trim() === "") {
            showError({
                title: "Invalid Name",
                description: "File name cannot be empty."
            });
            return;
        }

        setAttachments(prev => 
        prev.map(file => 
                file.id === fileId 
                ? { ...file, name: editingFileName } 
                : file
            )
        );

        setEditingFileId(null);
        setEditingFileName("");
        
        showSuccess({
            title: "File Renamed",
            description: "The file has been renamed successfully."
        });
    };

    // Get file icon based on type
    const getFileIcon = (type: string) => {
        if (type.startsWith("image/")) return <FileImage className="h-5 w-5" />;
        return <FileText className="h-5 w-5" />;
    };

    return (
        <Card className="w-full">
            <CardHeader className="p-4 pb-0">
                <CardTitle className="text-sm flex items-center gap-2">
                    <FilePlus className="h-4 w-4" />
                    File Attachments
                </CardTitle>
            </CardHeader>
            <CardContent className="p-4 pt-2">
                {!disabled && (
                    <div className="mb-4">
                        <Input ref={fileInputRef} type="file" multiple onChange={handleFileUpload} disabled={isUploading} className="mb-2"/>
                        <p className="text-xs text-muted-foreground">Max file size: 5MB</p>
                    </div>
                )}

                {attachments.length === 0 ? (
                    <div className="text-muted-foreground py-3 text-center">
                        No files attached
                    </div>
                ) : (
                <div className="space-y-2">
                    {attachments.map((file) => (
                        <div key={file.id} className="flex items-center justify-between p-2 rounded border bg-secondary/30">
                            <div className="flex items-center gap-2 flex-1 min-w-0">
                                {getFileIcon(file.type)}
                                
                                {editingFileId === file.id ? (
                                    <div className="flex-1 flex gap-2">
                                        <Input value={editingFileName} onChange={(e) => setEditingFileName(e.target.value)} className="text-sm h-8" autoFocus/>
                                        <Button size="sm" variant="outline" onClick={() => saveFileName(file.id)} className="h-8 px-2">
                                            Save
                                        </Button>
                                        <Button size="sm" variant="ghost" onClick={() => setEditingFileId(null)} className="h-8 px-2">
                                            Cancel
                                        </Button>
                                    </div>
                                ) : (
                                    <div className="flex-1 min-w-0">
                                        <div className="text-sm font-medium truncate" title={file.name}>
                                            {file.name}
                                        </div>
                                        <div className="text-xs text-muted-foreground flex gap-2">
                                            <span>{formatFileSize(file.size, file.unit)}</span>
                                        </div>
                                    </div>
                                )}
                            </div>
                            
                            {!disabled && !editingFileId && (
                            <div className="flex gap-1">
                                    {/* <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => handleDownloadFile(file)}>
                                        <FileText className="h-4 w-4" />
                                    </Button> */}
                                    {/* <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => handleEditFileName(file)}>
                                        <Pencil className="h-4 w-4" />
                                    </Button> */}
                                    <Button variant="ghost" size="icon" className="h-8 w-8 hover:text-destructive" onClick={() => handleDeleteFile(file.id)}>
                                        <Trash2 className="h-4 w-4" />
                                    </Button>
                                </div>
                            )}
                        </div>
                    ))}
                </div>
                )}

                {/* Delete File Confirmation Dialog */}
                <AlertDialog open={!!fileToDelete} onOpenChange={(open) => !open && setFileToDelete(null)}>
                    <AlertDialogContent>
                        <AlertDialogHeader>
                            <AlertDialogTitle>Delete File</AlertDialogTitle>
                            <AlertDialogDescription>
                                Are you sure you want to delete this file? This action cannot be undone.
                            </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                            <AlertDialogCancel>Cancel</AlertDialogCancel>
                            <AlertDialogAction onClick={confirmDeleteFile} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
                                Delete
                            </AlertDialogAction>
                        </AlertDialogFooter>
                    </AlertDialogContent>
                    </AlertDialog>
            </CardContent>
        </Card>
    );
};
