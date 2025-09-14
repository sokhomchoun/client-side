import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { FileText, FileImage, Search, Upload, FolderOpen, Download, FolderPlus, Trash2, ArrowLeft, Share2, Edit3, Copy, Check, Camera, ChevronRight, Home, Grid3X3, List, Filter, ArrowUpAZ, ArrowDownAZ, Calendar, Clock, Eye, EyeOff, Users, Lock } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import { AspectRatio } from "@/components/ui/aspect-ratio";
import { Switch } from "@/components/ui/switch";

interface FileAttachment {
  id: string;
  name: string;
  size: number;
  type: string;
  lastModified: number;
  content?: string;
  createdAt: string;
  thumbnail?: string;
  isPrivate?: boolean;
  sharedWith?: string[];
  createdBy?: string;
  modifiedBy?: string;
  modifiedAt?: string;
}

interface Deal {
  id: string;
  title: string;
  company: string;
  value: number;
  thumbnail?: string;
}

interface CustomFolder {
  id: string;
  name: string;
  createdAt: string;
  thumbnail?: string;
  parentId?: string;
  isPrivate?: boolean;
  sharedWith?: string[];
  createdBy?: string;
  modifiedBy?: string;
  modifiedAt?: string;
}

interface BreadcrumbItem {
  id: string | null;
  name: string;
}

type SortOption = "name-asc" | "name-desc" | "date-newest" | "date-oldest" | "size-asc" | "size-desc";

const Library = () => {
  const [viewMode, setViewMode] = useState<string>("deals");
  const [displayMode, setDisplayMode] = useState<"grid" | "list">("grid");
  const [sortBy, setSortBy] = useState<SortOption>("name-asc");
  const [showDetails, setShowDetails] = useState<boolean>(false);
  const [currentFolderId, setCurrentFolderId] = useState<string | null>(null);
  const [currentDealId, setCurrentDealId] = useState<string | null>(null);
  const [folderPath, setFolderPath] = useState<BreadcrumbItem[]>([]);
  const [allFiles, setAllFiles] = useState<(FileAttachment & { dealId: string; dealTitle: string })[]>([]);
  const [generalFiles, setGeneralFiles] = useState<(FileAttachment & { folderId: string; folderName: string })[]>([]);
  const [deals, setDeals] = useState<Deal[]>([]);
  const [customFolders, setCustomFolders] = useState<CustomFolder[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedDeal, setSelectedDeal] = useState<string>("all");
  const [selectedFolder, setSelectedFolder] = useState<string>("all");
  const [uploadDialogOpen, setUploadDialogOpen] = useState(false);
  const [folderDialogOpen, setFolderDialogOpen] = useState(false);
  const [selectedDealForUpload, setSelectedDealForUpload] = useState<string>("");
  const [selectedFolderForUpload, setSelectedFolderForUpload] = useState<string>("");
  const [newFolderName, setNewFolderName] = useState<string>("");
  const [editingItem, setEditingItem] = useState<{ type: 'file' | 'folder'; id: string; name: string } | null>(null);
  const [editName, setEditName] = useState("");
  const [shareDialogOpen, setShareDialogOpen] = useState(false);
  const [shareItem, setShareItem] = useState<{ type: 'file' | 'folder'; name: string; url: string } | null>(null);
  const [copiedLink, setCopiedLink] = useState(false);
  const [thumbnailDialogOpen, setThumbnailDialogOpen] = useState(false);
  const [thumbnailItem, setThumbnailItem] = useState<{ type: 'file' | 'folder'; id: string; name: string } | null>(null);
  const [draggedItem, setDraggedItem] = useState<{ type: 'file' | 'folder'; id: string } | null>(null);
  const [detailsItem, setDetailsItem] = useState<{ type: 'file' | 'folder'; item: any } | null>(null);
  const [detailsDialogOpen, setDetailsDialogOpen] = useState(false);

  // Load data on component mount
  useEffect(() => {
    loadDealsData();
    loadCustomFolders();
    loadGeneralFiles();
  }, []);

  const loadDealsData = () => {
    const savedDeals = localStorage.getItem('deals');
    let dealsData: Deal[] = [];
    
    if (savedDeals) {
      try {
        dealsData = JSON.parse(savedDeals);
        setDeals(dealsData);
      } catch (e) {
        console.error("Failed to parse deals", e);
      }
    }

    const allFilesData: (FileAttachment & { dealId: string; dealTitle: string })[] = [];

    dealsData.forEach(deal => {
      const dealFiles = localStorage.getItem(`deal-attachments-${deal.id}`);
      if (dealFiles) {
        try {
          const files: FileAttachment[] = JSON.parse(dealFiles);
          files.forEach(file => {
            allFilesData.push({
              ...file,
              dealId: deal.id,
              dealTitle: deal.title
            });
          });
        } catch (e) {
          console.error(`Failed to parse files for deal ${deal.id}`, e);
        }
      }
    });

    setAllFiles(allFilesData);
  };

  const loadCustomFolders = () => {
    const savedFolders = localStorage.getItem('custom-folders');
    if (savedFolders) {
      try {
        setCustomFolders(JSON.parse(savedFolders));
      } catch (e) {
        console.error("Failed to parse custom folders", e);
      }
    }
  };

  const loadGeneralFiles = () => {
    const savedFolders = localStorage.getItem('custom-folders');
    let folders: CustomFolder[] = [];
    
    if (savedFolders) {
      try {
        folders = JSON.parse(savedFolders);
      } catch (e) {
        console.error("Failed to parse custom folders", e);
      }
    }

    const generalFilesData: (FileAttachment & { folderId: string; folderName: string })[] = [];

    folders.forEach(folder => {
      const folderFiles = localStorage.getItem(`folder-files-${folder.id}`);
      if (folderFiles) {
        try {
          const files: FileAttachment[] = JSON.parse(folderFiles);
          files.forEach(file => {
            generalFilesData.push({
              ...file,
              folderId: folder.id,
              folderName: folder.name
            });
          });
        } catch (e) {
          console.error(`Failed to parse files for folder ${folder.id}`, e);
        }
      }
    });

    setGeneralFiles(generalFilesData);
  };

  // Drag and drop handlers
  const handleDragStart = (e: React.DragEvent, type: 'file' | 'folder', id: string) => {
    setDraggedItem({ type, id });
    e.dataTransfer.effectAllowed = 'move';
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
  };

  const handleDrop = (e: React.DragEvent, targetFolderId: string) => {
    e.preventDefault();
    
    if (!draggedItem) return;

    // Don't allow dropping on itself
    if (draggedItem.id === targetFolderId) {
      setDraggedItem(null);
      return;
    }

    if (draggedItem.type === 'folder') {
      // Move folder
      moveFolder(draggedItem.id, targetFolderId);
    } else {
      // Move file
      moveFile(draggedItem.id, targetFolderId);
    }

    setDraggedItem(null);
  };

  const moveFolder = (folderId: string, targetFolderId: string) => {
    // Prevent circular references
    if (isCircularReference(folderId, targetFolderId)) {
      toast.error("Cannot move folder to its own subfolder.");
      return;
    }

    const updatedFolders = customFolders.map(folder =>
      folder.id === folderId ? { ...folder, parentId: targetFolderId } : folder
    );
    
    setCustomFolders(updatedFolders);
    localStorage.setItem('custom-folders', JSON.stringify(updatedFolders));
    toast.success("Folder moved successfully.");
  };

  const moveFile = (fileId: string, targetFolderId: string) => {
    if (viewMode === "deals") {
      // Can't move files between deals from library view
      toast.error("Files cannot be moved between deals from the library view.");
      return;
    }

    // Find the file in general files
    const fileToMove = generalFiles.find(f => f.id === fileId);
    if (!fileToMove) return;

    // Remove from old folder
    const oldFolderId = fileToMove.folderId;
    const oldFolderFiles = localStorage.getItem(`folder-files-${oldFolderId}`);
    if (oldFolderFiles) {
      const files: FileAttachment[] = JSON.parse(oldFolderFiles);
      const updatedOldFiles = files.filter(f => f.id !== fileId);
      localStorage.setItem(`folder-files-${oldFolderId}`, JSON.stringify(updatedOldFiles));
    }

    // Add to new folder
    const newFolderFiles = localStorage.getItem(`folder-files-${targetFolderId}`);
    let newFiles: FileAttachment[] = [];
    if (newFolderFiles) {
      newFiles = JSON.parse(newFolderFiles);
    }
    
    const { folderId, folderName, ...fileData } = fileToMove;
    newFiles.push(fileData);
    localStorage.setItem(`folder-files-${targetFolderId}`, JSON.stringify(newFiles));

    // Update state
    const targetFolder = customFolders.find(f => f.id === targetFolderId);
    const updatedGeneralFiles = generalFiles.map(file =>
      file.id === fileId
        ? { ...file, folderId: targetFolderId, folderName: targetFolder?.name || "Unknown Folder" }
        : file
    );
    setGeneralFiles(updatedGeneralFiles);

    toast.success("File moved successfully.");
  };

  const isCircularReference = (folderId: string, targetFolderId: string): boolean => {
    let currentId = targetFolderId;
    while (currentId) {
      if (currentId === folderId) return true;
      const folder = customFolders.find(f => f.id === currentId);
      currentId = folder?.parentId || null;
    }
    return false;
  };

  // Navigation functions
  const handleFolderDoubleClick = (folderId: string) => {
    const folder = customFolders.find(f => f.id === folderId) || deals.find(d => d.id === folderId);
    if (folder) {
      const folderName = 'title' in folder ? folder.title : folder.name;
      
      if (viewMode === "deals") {
        setCurrentDealId(folderId);
        setFolderPath([{ id: null, name: "Deals" }, { id: folderId, name: folderName }]);
      } else {
        setCurrentFolderId(folderId);
        const newPath = [...folderPath, { id: folderId, name: folderName }];
        if (folderPath.length === 0) {
          newPath.unshift({ id: null, name: "General Library" });
        }
        setFolderPath(newPath);
      }
    }
    setSearchTerm("");
  };

  const handleBreadcrumbNavigation = (targetId: string | null, index: number) => {
    if (viewMode === "deals") {
      setCurrentDealId(targetId);
      setFolderPath(folderPath.slice(0, index + 1));
    } else {
      setCurrentFolderId(targetId);
      setFolderPath(folderPath.slice(0, index + 1));
    }
    setSearchTerm("");
  };

  const handleBackToFolders = () => {
    if (folderPath.length > 1) {
      const parentIndex = folderPath.length - 2;
      const parentId = folderPath[parentIndex].id;
      handleBreadcrumbNavigation(parentId, parentIndex);
    } else {
      setCurrentFolderId(null);
      setCurrentDealId(null);
      setFolderPath([]);
      setSearchTerm("");
    }
  };

  // Create new custom folder
  const handleCreateFolder = () => {
    if (!newFolderName.trim()) {
      toast.error("Please enter a folder name.");
      return;
    }

    const newFolder: CustomFolder = {
      id: `folder-${Date.now()}`,
      name: newFolderName.trim(),
      createdAt: new Date().toISOString(),
      parentId: currentFolderId || undefined
    };

    const updatedFolders = [...customFolders, newFolder];
    setCustomFolders(updatedFolders);
    localStorage.setItem('custom-folders', JSON.stringify(updatedFolders));
    
    toast.success(`Folder "${newFolderName}" created successfully.`);
    setNewFolderName("");
    setFolderDialogOpen(false);
  };

  // Delete custom folder
  const handleDeleteFolder = (folderId: string) => {
    const folderToDelete = customFolders.find(f => f.id === folderId);
    if (!folderToDelete) return;

    // Remove all subfolders recursively
    const getAllSubfolderIds = (parentId: string): string[] => {
      const subfolders = customFolders.filter(f => f.parentId === parentId);
      let allIds = [parentId];
      subfolders.forEach(subfolder => {
        allIds = [...allIds, ...getAllSubfolderIds(subfolder.id)];
      });
      return allIds;
    };

    const foldersToDelete = getAllSubfolderIds(folderId);
    
    // Remove folder files for all folders being deleted
    foldersToDelete.forEach(id => {
      localStorage.removeItem(`folder-files-${id}`);
    });
    
    // Remove folders from list
    const updatedFolders = customFolders.filter(f => !foldersToDelete.includes(f.id));
    setCustomFolders(updatedFolders);
    localStorage.setItem('custom-folders', JSON.stringify(updatedFolders));
    
    // Update general files state
    setGeneralFiles(prev => prev.filter(f => !foldersToDelete.includes(f.folderId)));
    
    toast.success(`Folder "${folderToDelete.name}" and all subfolders deleted successfully.`);
    
    // Navigate back if we're currently in a deleted folder
    if (foldersToDelete.includes(currentFolderId || '')) {
      handleBackToFolders();
    }
  };

  // Edit item name
  const handleEditItem = (type: 'file' | 'folder', id: string, currentName: string) => {
    setEditingItem({ type, id, name: currentName });
    setEditName(currentName);
  };

  const handleSaveEdit = () => {
    if (!editingItem || !editName.trim()) {
      toast.error("Please enter a valid name.");
      return;
    }

    if (editingItem.type === 'folder') {
      if (viewMode === "deals") {
        // Can't edit deal names from library
        toast.error("Deal names cannot be edited from the library.");
      } else {
        // Edit custom folder
        const updatedFolders = customFolders.map(folder => 
          folder.id === editingItem.id 
            ? { ...folder, name: editName.trim() }
            : folder
        );
        setCustomFolders(updatedFolders);
        localStorage.setItem('custom-folders', JSON.stringify(updatedFolders));
        
        // Update general files with new folder name
        const updatedGeneralFiles = generalFiles.map(file =>
          file.folderId === editingItem.id
            ? { ...file, folderName: editName.trim() }
            : file
        );
        setGeneralFiles(updatedGeneralFiles);
        
        toast.success("Folder renamed successfully.");
      }
    } else {
      // Edit file name
      if (viewMode === "deals" && currentDealId) {
        const existingAttachments = localStorage.getItem(`deal-attachments-${currentDealId}`);
        if (existingAttachments) {
          const attachments: FileAttachment[] = JSON.parse(existingAttachments);
          const updatedAttachments = attachments.map(file =>
            file.id === editingItem.id
              ? { ...file, name: editName.trim() }
              : file
          );
          localStorage.setItem(`deal-attachments-${currentDealId}`, JSON.stringify(updatedAttachments));
          
          // Update allFiles state
          setAllFiles(prev => prev.map(file =>
            file.id === editingItem.id
              ? { ...file, name: editName.trim() }
              : file
          ));
        }
      } else if (viewMode === "general" && currentFolderId) {
        const existingFiles = localStorage.getItem(`folder-files-${currentFolderId}`);
        if (existingFiles) {
          const files: FileAttachment[] = JSON.parse(existingFiles);
          const updatedFiles = files.map(file =>
            file.id === editingItem.id
              ? { ...file, name: editName.trim() }
              : file
          );
          localStorage.setItem(`folder-files-${currentFolderId}`, JSON.stringify(updatedFiles));
          
          // Update generalFiles state
          setGeneralFiles(prev => prev.map(file =>
            file.id === editingItem.id
              ? { ...file, name: editName.trim() }
              : file
          ));
        }
      }
      toast.success("File renamed successfully.");
    }

    setEditingItem(null);
    setEditName("");
  };

  // Delete file
  const handleDeleteFile = (fileId: string) => {
    if (viewMode === "deals" && currentDealId) {
      const existingAttachments = localStorage.getItem(`deal-attachments-${currentDealId}`);
      if (existingAttachments) {
        const attachments: FileAttachment[] = JSON.parse(existingAttachments);
        const updatedAttachments = attachments.filter(file => file.id !== fileId);
        localStorage.setItem(`deal-attachments-${currentDealId}`, JSON.stringify(updatedAttachments));
        
        setAllFiles(prev => prev.filter(file => file.id !== fileId));
      }
    } else if (viewMode === "general" && currentFolderId) {
      const existingFiles = localStorage.getItem(`folder-files-${currentFolderId}`);
      if (existingFiles) {
        const files: FileAttachment[] = JSON.parse(existingFiles);
        const updatedFiles = files.filter(file => file.id !== fileId);
        localStorage.setItem(`folder-files-${currentFolderId}`, JSON.stringify(updatedFiles));
        
        setGeneralFiles(prev => prev.filter(file => file.id !== fileId));
      }
    }
    toast.success("File deleted successfully.");
  };

  // Generate shareable link
  const handleShareItem = (type: 'file' | 'folder', name: string, id: string) => {
    const baseUrl = window.location.origin;
    const shareUrl = `${baseUrl}/library/share/${type}/${id}`;
    
    setShareItem({ type, name, url: shareUrl });
    setShareDialogOpen(true);
    setCopiedLink(false);
  };

  const handleCopyLink = async () => {
    if (!shareItem) return;
    
    try {
      await navigator.clipboard.writeText(shareItem.url);
      setCopiedLink(true);
      toast.success("Link copied to clipboard!");
      
      setTimeout(() => setCopiedLink(false), 2000);
    } catch (error) {
      toast.error("Failed to copy link.");
    }
  };

  // Format file size
  const formatFileSize = (bytes: number): string => {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };

  // Get file icon
  const getFileIcon = (type: string) => {
    if (type.startsWith("image/")) return <FileImage className="h-5 w-5" />;
    return <FileText className="h-5 w-5" />;
  };

  // Handle file upload
  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    const isDealsMode = viewMode === "deals";
    const targetId = isDealsMode ? selectedDealForUpload : selectedFolderForUpload;
    
    if (!targetId) {
      toast.error(`Please select a ${isDealsMode ? 'deal' : 'folder'}.`);
      return;
    }

    try {
      const newAttachments: FileAttachment[] = [];

      for (let i = 0; i < files.length; i++) {
        const file = files[i];
        if (file.size > 5 * 1024 * 1024) {
          toast.error(`${file.name} exceeds the 5MB limit.`);
          continue;
        }

        const content = await readFileAsBase64(file);
        
        // Auto-generate thumbnail for image files and use the image itself as thumbnail
        let thumbnail: string | undefined;
        if (file.type.startsWith('image/')) {
          try {
            thumbnail = await generateThumbnailFromImage(content);
          } catch (error) {
            console.error("Failed to generate thumbnail:", error);
            // Fallback: use the original image as thumbnail
            thumbnail = content;
          }
        }
        
        newAttachments.push({
          id: `attachment-${Date.now()}-${i}`,
          name: file.name,
          size: file.size,
          type: file.type,
          lastModified: file.lastModified,
          content,
          thumbnail,
          createdAt: new Date().toISOString()
        });
      }

      if (newAttachments.length > 0) {
        if (isDealsMode) {
          // Handle deal uploads
          const existingAttachments = localStorage.getItem(`deal-attachments-${targetId}`);
          let dealAttachments: FileAttachment[] = [];
          
          if (existingAttachments) {
            try {
              dealAttachments = JSON.parse(existingAttachments);
            } catch (e) {
              console.error("Failed to parse existing attachments", e);
            }
          }

          const updatedAttachments = [...dealAttachments, ...newAttachments];
          localStorage.setItem(`deal-attachments-${targetId}`, JSON.stringify(updatedAttachments));

          const dealTitle = deals.find(d => d.id === targetId)?.title || "Unknown Deal";
          const newFilesWithDeal = newAttachments.map(file => ({
            ...file,
            dealId: targetId,
            dealTitle
          }));

          setAllFiles(prev => [...prev, ...newFilesWithDeal]);
        } else {
          // Handle folder uploads
          const existingFiles = localStorage.getItem(`folder-files-${targetId}`);
          let folderFiles: FileAttachment[] = [];
          
          if (existingFiles) {
            try {
              folderFiles = JSON.parse(existingFiles);
            } catch (e) {
              console.error("Failed to parse existing folder files", e);
            }
          }

          const updatedFiles = [...folderFiles, ...newAttachments];
          localStorage.setItem(`folder-files-${targetId}`, JSON.stringify(updatedFiles));

          const folderName = customFolders.find(f => f.id === targetId)?.name || "Unknown Folder";
          const newFilesWithFolder = newAttachments.map(file => ({
            ...file,
            folderId: targetId,
            folderName
          }));

          setGeneralFiles(prev => [...prev, ...newFilesWithFolder]);
        }
        
        toast.success(`${newAttachments.length} file(s) uploaded successfully.`);
        setUploadDialogOpen(false);
        setSelectedDealForUpload("");
        setSelectedFolderForUpload("");
      }
    } catch (error) {
      console.error("Error uploading files", error);
      toast.error("There was a problem uploading your files.");
    }
  };

  // Read file as base64
  const readFileAsBase64 = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => {
        if (typeof reader.result === "string") {
          resolve(reader.result);
        } else {
          reject(new Error("Failed to read file as base64"));
        }
      };
      reader.onerror = () => reject(reader.error);
      reader.readAsDataURL(file);
    });
  };

  // Generate thumbnail from image file
  const generateThumbnailFromImage = (imageContent: string): Promise<string> => {
    return new Promise((resolve) => {
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      const img = new Image();
      
      img.onload = () => {
        const size = 150;
        canvas.width = size;
        canvas.height = size;
        
        // Calculate aspect ratio and crop to square
        const minDimension = Math.min(img.width, img.height);
        const x = (img.width - minDimension) / 2;
        const y = (img.height - minDimension) / 2;
        
        ctx?.drawImage(img, x, y, minDimension, minDimension, 0, 0, size, size);
        resolve(canvas.toDataURL('image/jpeg', 0.8));
      };
      
      img.src = imageContent;
    });
  };

  // Save thumbnail to appropriate storage
  const saveThumbnail = async (type: 'file' | 'folder', id: string, thumbnail: string) => {
    if (type === 'folder') {
      if (viewMode === "deals") {
        // Update deal thumbnail
        const updatedDeals = deals.map(deal => 
          deal.id === id ? { ...deal, thumbnail } : deal
        );
        setDeals(updatedDeals);
        localStorage.setItem('deals', JSON.stringify(updatedDeals));
      } else {
        // Update custom folder thumbnail
        const updatedFolders = customFolders.map(folder => 
          folder.id === id ? { ...folder, thumbnail } : folder
        );
        setCustomFolders(updatedFolders);
        localStorage.setItem('custom-folders', JSON.stringify(updatedFolders));
      }
    } else {
      // Update file thumbnail
      if (viewMode === "deals" && currentDealId) {
        const existingAttachments = localStorage.getItem(`deal-attachments-${currentDealId}`);
        if (existingAttachments) {
          const attachments: FileAttachment[] = JSON.parse(existingAttachments);
          const updatedAttachments = attachments.map(file =>
            file.id === id ? { ...file, thumbnail } : file
          );
          localStorage.setItem(`deal-attachments-${currentDealId}`, JSON.stringify(updatedAttachments));
          
          setAllFiles(prev => prev.map(file =>
            file.id === id ? { ...file, thumbnail } : file
          ));
        }
      } else if (viewMode === "general" && currentFolderId) {
        const existingFiles = localStorage.getItem(`folder-files-${currentFolderId}`);
        if (existingFiles) {
          const files: FileAttachment[] = JSON.parse(existingFiles);
          const updatedFiles = files.map(file =>
            file.id === id ? { ...file, thumbnail } : file
          );
          localStorage.setItem(`folder-files-${currentFolderId}`, JSON.stringify(updatedFiles));
          
          setGeneralFiles(prev => prev.map(file =>
            file.id === id ? { ...file, thumbnail } : file
          ));
        }
      }
    }
  };

  // Handle thumbnail upload
  const handleThumbnailUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !thumbnailItem) return;

    if (!file.type.startsWith('image/')) {
      toast.error("Please select an image file for the thumbnail.");
      return;
    }

    if (file.size > 2 * 1024 * 1024) {
      toast.error("Thumbnail image must be smaller than 2MB.");
      return;
    }

    try {
      const thumbnailContent = await readFileAsBase64(file);
      const thumbnail = await generateThumbnailFromImage(thumbnailContent);
      
      await saveThumbnail(thumbnailItem.type, thumbnailItem.id, thumbnail);
      
      toast.success("Thumbnail uploaded successfully.");
      setThumbnailDialogOpen(false);
      setThumbnailItem(null);
    } catch (error) {
      console.error("Error uploading thumbnail:", error);
      toast.error("Failed to upload thumbnail.");
    }
  };

  // Download file
  const handleDownloadFile = (file: FileAttachment) => {
    if (!file.content) {
      toast.error("File content not available.");
      return;
    }

    const link = document.createElement("a");
    link.href = file.content;
    link.download = file.name;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Sort function
  const sortItems = (items: any[], type: 'file' | 'folder') => {
    return [...items].sort((a, b) => {
      switch (sortBy) {
        case "name-asc":
          const nameA = type === 'folder' ? (viewMode === "deals" ? a.title : a.name) : a.name;
          const nameB = type === 'folder' ? (viewMode === "deals" ? b.title : b.name) : b.name;
          return nameA.localeCompare(nameB);
        case "name-desc":
          const nameA2 = type === 'folder' ? (viewMode === "deals" ? a.title : a.name) : a.name;
          const nameB2 = type === 'folder' ? (viewMode === "deals" ? b.title : b.name) : b.name;
          return nameB2.localeCompare(nameA2);
        case "date-newest":
          const dateA = new Date(a.modifiedAt || a.createdAt).getTime();
          const dateB = new Date(b.modifiedAt || b.createdAt).getTime();
          return dateB - dateA;
        case "date-oldest":
          const dateA2 = new Date(a.modifiedAt || a.createdAt).getTime();
          const dateB2 = new Date(b.modifiedAt || b.createdAt).getTime();
          return dateA2 - dateB2;
        case "size-asc":
          if (type === 'file') return a.size - b.size;
          return 0;
        case "size-desc":
          if (type === 'file') return b.size - a.size;
          return 0;
        default:
          return 0;
      }
    });
  };

  // Handle privacy toggle
  const handlePrivacyToggle = (type: 'file' | 'folder', id: string, isPrivate: boolean) => {
    if (type === 'folder') {
      if (viewMode === "deals") {
        // Can't change deal privacy from library
        toast.error("Deal privacy cannot be changed from the library.");
        return;
      } else {
        const updatedFolders = customFolders.map(folder => 
          folder.id === id ? { ...folder, isPrivate } : folder
        );
        setCustomFolders(updatedFolders);
        localStorage.setItem('custom-folders', JSON.stringify(updatedFolders));
      }
    } else {
      // Update file privacy
      if (viewMode === "deals" && currentDealId) {
        const existingAttachments = localStorage.getItem(`deal-attachments-${currentDealId}`);
        if (existingAttachments) {
          const attachments: FileAttachment[] = JSON.parse(existingAttachments);
          const updatedAttachments = attachments.map(file =>
            file.id === id ? { ...file, isPrivate } : file
          );
          localStorage.setItem(`deal-attachments-${currentDealId}`, JSON.stringify(updatedAttachments));
          setAllFiles(prev => prev.map(file =>
            file.id === id ? { ...file, isPrivate } : file
          ));
        }
      } else if (viewMode === "general" && currentFolderId) {
        const existingFiles = localStorage.getItem(`folder-files-${currentFolderId}`);
        if (existingFiles) {
          const files: FileAttachment[] = JSON.parse(existingFiles);
          const updatedFiles = files.map(file =>
            file.id === id ? { ...file, isPrivate } : file
          );
          localStorage.setItem(`folder-files-${currentFolderId}`, JSON.stringify(updatedFiles));
          setGeneralFiles(prev => prev.map(file =>
            file.id === id ? { ...file, isPrivate } : file
          ));
        }
      }
    }
    toast.success(`${type === 'folder' ? 'Folder' : 'File'} privacy updated.`);
  };

  // Show item details
  const handleShowDetails = (type: 'file' | 'folder', item: any) => {
    setDetailsItem({ type, item });
    setDetailsDialogOpen(true);
  };

  // Format date
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString();
  };

  // Get current view data with sorting
  const getCurrentViewData = () => {
    if (viewMode === "deals") {
      if (currentDealId) {
        const files = allFiles.filter(f => f.dealId === currentDealId && f.name.toLowerCase().includes(searchTerm.toLowerCase()));
        return {
          isInFolder: true,
          folderName: deals.find(d => d.id === currentDealId)?.title || "Unknown Deal",
          files: sortItems(files, 'file'),
          folders: []
        };
      } else {
        const folders = deals.filter(deal => deal.title.toLowerCase().includes(searchTerm.toLowerCase()));
        return {
          isInFolder: false,
          folders: sortItems(folders, 'folder')
        };
      }
    } else {
      if (currentFolderId) {
        const subfolders = customFolders.filter(f => 
          f.parentId === currentFolderId && 
          f.name.toLowerCase().includes(searchTerm.toLowerCase())
        );
        const files = generalFiles.filter(f => 
          f.folderId === currentFolderId && 
          f.name.toLowerCase().includes(searchTerm.toLowerCase())
        );
        
        return {
          isInFolder: true,
          folderName: customFolders.find(f => f.id === currentFolderId)?.name || "Unknown Folder",
          files: sortItems(files, 'file'),
          folders: sortItems(subfolders, 'folder')
        };
      } else {
        const rootFolders = customFolders.filter(f => 
          !f.parentId && 
          f.name.toLowerCase().includes(searchTerm.toLowerCase())
        );
        
        return {
          isInFolder: false,
          folders: sortItems(rootFolders, 'folder')
        };
      }
    }
  };

  const currentViewData = getCurrentViewData();

  // Render functions for different view modes
  const renderGridView = (items: any[], type: 'folder' | 'file') => {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {items.map((item) => {
          const fileCount = type === 'folder' 
            ? (viewMode === "deals" 
                ? allFiles.filter(f => f.dealId === item.id).length
                : generalFiles.filter(f => f.folderId === item.id).length)
            : 0;
          
          return (
            <div
              key={item.id}
              className={`flex flex-col p-4 rounded border bg-secondary/30 hover:bg-secondary/50 transition-colors cursor-pointer ${
                type === 'folder' ? 'drop-zone' : ''
              }`}
              draggable={true}
              onDragStart={(e) => handleDragStart(e, type, item.id)}
              onDragOver={type === 'folder' ? handleDragOver : undefined}
              onDrop={type === 'folder' ? (e) => handleDrop(e, item.id) : undefined}
              onDoubleClick={type === 'folder' ? () => handleFolderDoubleClick(item.id) : undefined}
            >
              {/* Privacy indicator */}
              <div className="flex justify-between items-start mb-2">
                <div className="flex gap-1">
                  {item.isPrivate ? (
                    <Lock className="h-3 w-3 text-red-500" />
                  ) : (
                    <Users className="h-3 w-3 text-green-500" />
                  )}
                </div>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-6 w-6"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleShowDetails(type, item);
                  }}
                >
                  <Eye className="h-3 w-3" />
                </Button>
              </div>

              {/* Thumbnail */}
              <div className="w-full mb-3">
                {item.thumbnail ? (
                  <AspectRatio ratio={1} className="w-full">
                    <img 
                      src={item.thumbnail} 
                      alt={type === 'folder' ? (viewMode === "deals" ? item.title : item.name) : item.name}
                      className="w-full h-full object-cover rounded border"
                    />
                  </AspectRatio>
                ) : (
                  <AspectRatio ratio={1} className="w-full">
                    <div className="w-full h-full flex items-center justify-center bg-muted rounded border">
                      {type === 'folder' ? (
                        <FolderOpen className="h-12 w-12 text-primary" />
                      ) : (
                        getFileIcon(item.type)
                      )}
                    </div>
                  </AspectRatio>
                )}
              </div>

              {/* Item details */}
              <div className="flex-1 min-w-0 mb-3">
                {editingItem?.id === item.id ? (
                  <div className="space-y-2">
                    <Input
                      value={editName}
                      onChange={(e) => setEditName(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') handleSaveEdit();
                        if (e.key === 'Escape') {
                          setEditingItem(null);
                          setEditName("");
                        }
                      }}
                      className="text-sm"
                      autoFocus
                    />
                    <div className="flex gap-1">
                      <Button size="sm" onClick={handleSaveEdit}>Save</Button>
                      <Button size="sm" variant="outline" onClick={() => {
                        setEditingItem(null);
                        setEditName("");
                      }}>Cancel</Button>
                    </div>
                  </div>
                ) : (
                  <>
                    <div className="text-sm font-medium truncate" title={
                      type === 'folder' 
                        ? (viewMode === "deals" ? `${item.title} - ${item.company}` : item.name)
                        : item.name
                    }>
                      {type === 'folder' 
                        ? (viewMode === "deals" ? item.title : item.name)
                        : item.name}
                    </div>
                    {type === 'folder' && viewMode === "deals" && (
                      <div className="text-xs text-muted-foreground truncate">
                        {item.company}
                      </div>
                    )}
                    <div className="text-xs text-muted-foreground">
                      {type === 'folder' ? `${fileCount} files` : formatFileSize(item.size)}
                    </div>
                    {showDetails && (
                      <div className="text-xs text-muted-foreground mt-1">
                        Modified: {formatDate(item.modifiedAt || item.createdAt)}
                      </div>
                    )}
                  </>
                )}
              </div>

              {/* Action buttons - keep existing action buttons code */}
              {!editingItem && (
                <div className="flex gap-1 flex-wrap">
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8"
                    onClick={(e) => {
                      e.stopPropagation();
                      setThumbnailItem({ 
                        type: type, 
                        id: item.id, 
                        name: type === 'folder' 
                          ? (viewMode === "deals" ? item.title : item.name)
                          : item.name 
                      });
                      setThumbnailDialogOpen(true);
                    }}
                  >
                    <Camera className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleShareItem(type, type === 'folder' 
                        ? (viewMode === "deals" ? item.title : item.name)
                        : item.name, item.id);
                    }}
                  >
                    <Share2 className="h-4 w-4" />
                  </Button>
                  {(type === 'file' || (type === 'folder' && viewMode === "general")) && (
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleEditItem(type, item.id, type === 'folder' ? item.name : item.name);
                      }}
                    >
                      <Edit3 className="h-4 w-4" />
                    </Button>
                  )}
                  {type === 'file' && (
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDownloadFile(item);
                      }}
                    >
                      <Download className="h-4 w-4" />
                    </Button>
                  )}
                  {(type === 'file' || (type === 'folder' && viewMode === "general")) && (
                    <AlertDialog>
                      <AlertDialogTrigger asChild>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8 text-destructive hover:text-destructive"
                          onClick={(e) => e.stopPropagation()}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </AlertDialogTrigger>
                      <AlertDialogContent>
                        <AlertDialogHeader>
                          <AlertDialogTitle>Delete {type === 'folder' ? 'Folder' : 'File'}</AlertDialogTitle>
                          <AlertDialogDescription>
                            Are you sure you want to delete "{type === 'folder' ? item.name : item.name}"? This action cannot be undone.
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel>Cancel</AlertDialogCancel>
                          <AlertDialogAction onClick={() => type === 'folder' ? handleDeleteFolder(item.id) : handleDeleteFile(item.id)}>
                            Delete
                          </AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
                  )}
                </div>
              )}
            </div>
          );
        })}
      </div>
    );
  };

  const renderListView = (items: any[], type: 'folder' | 'file') => {
    return (
      <div className="space-y-2">
        {items.map((item) => {
          const fileCount = type === 'folder' 
            ? (viewMode === "deals" 
                ? allFiles.filter(f => f.dealId === item.id).length
                : generalFiles.filter(f => f.folderId === item.id).length)
            : 0;
          
          return (
            <div
              key={item.id}
              className={`flex items-center p-3 rounded border bg-secondary/30 hover:bg-secondary/50 transition-colors cursor-pointer ${
                type === 'folder' ? 'drop-zone' : ''
              }`}
              draggable={true}
              onDragStart={(e) => handleDragStart(e, type, item.id)}
              onDragOver={type === 'folder' ? handleDragOver : undefined}
              onDrop={type === 'folder' ? (e) => handleDrop(e, item.id) : undefined}
              onDoubleClick={type === 'folder' ? () => handleFolderDoubleClick(item.id) : undefined}
            >
              {/* Icon */}
              <div className="flex-shrink-0 mr-3">
                {item.thumbnail ? (
                  <img 
                    src={item.thumbnail} 
                    alt={type === 'folder' ? (viewMode === "deals" ? item.title : item.name) : item.name}
                    className="w-10 h-10 object-cover rounded"
                  />
                ) : (
                  <div className="w-10 h-10 flex items-center justify-center bg-muted rounded">
                    {type === 'folder' ? (
                      <FolderOpen className="h-6 w-6 text-primary" />
                    ) : (
                      getFileIcon(item.type)
                    )}
                  </div>
                )}
              </div>

              {/* Privacy indicator */}
              <div className="flex-shrink-0 mr-2">
                {item.isPrivate ? (
                  <Lock className="h-4 w-4 text-red-500" />
                ) : (
                  <Users className="h-4 w-4 text-green-500" />
                )}
              </div>

              {/* Item details */}
              <div className="flex-1 min-w-0">
                {editingItem?.id === item.id ? (
                  <div className="flex items-center gap-2">
                    <Input
                      value={editName}
                      onChange={(e) => setEditName(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') handleSaveEdit();
                        if (e.key === 'Escape') {
                          setEditingItem(null);
                          setEditName("");
                        }
                      }}
                      className="text-sm flex-1"
                      autoFocus
                    />
                    <Button size="sm" onClick={handleSaveEdit}>Save</Button>
                    <Button size="sm" variant="outline" onClick={() => {
                      setEditingItem(null);
                      setEditName("");
                    }}>Cancel</Button>
                  </div>
                ) : (
                  <>
                    <div className="font-medium truncate">
                      {type === 'folder' 
                        ? (viewMode === "deals" ? item.title : item.name)
                        : item.name}
                    </div>
                    <div className="text-sm text-muted-foreground">
                      {type === 'folder' 
                        ? `${fileCount} files`
                        : formatFileSize(item.size)}
                      {type === 'folder' && viewMode === "deals" && (
                        <span className="ml-2">• {item.company}</span>
                      )}
                      {showDetails && (
                        <span className="ml-2">• Modified: {formatDate(item.modifiedAt || item.createdAt)}</span>
                      )}
                    </div>
                  </>
                )}
              </div>

              {/* Action buttons - keep existing action buttons code but add details button */}
              {!editingItem && (
                <div className="flex gap-1 ml-4">
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleShowDetails(type, item);
                    }}
                  >
                    <Eye className="h-4 w-4" />
                  </Button>
                  {/* Keep all existing action buttons */}
                </div>
              )}
            </div>
          );
        })}
      </div>
    );
  };

  return (
    <div className="container mx-auto p-6 space-y-6">
      {/* Header section */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div className="flex items-center gap-4">
          {currentViewData.isInFolder && (
            <Button variant="outline" onClick={handleBackToFolders} className="flex items-center gap-2">
              <ArrowLeft className="h-4 w-4" />
              Back
            </Button>
          )}
          <div className="flex flex-col gap-2">
            <h1 className="text-3xl font-bold">
              {currentViewData.isInFolder ? currentViewData.folderName : "Document Library"}
            </h1>
            
            {/* Breadcrumb navigation */}
            {folderPath.length > 0 && (
              <nav className="flex items-center text-sm text-muted-foreground">
                <Home className="h-4 w-4 mr-1" />
                {folderPath.map((item, index) => (
                  <div key={item.id || 'root'} className="flex items-center">
                    <button
                      onClick={() => handleBreadcrumbNavigation(item.id, index)}
                      className="hover:text-primary transition-colors"
                    >
                      {item.name}
                    </button>
                    {index < folderPath.length - 1 && (
                      <ChevronRight className="h-4 w-4 mx-1" />
                    )}
                  </div>
                ))}
              </nav>
            )}
          </div>
        </div>
        
        <div className="flex gap-2">
          {/* View controls */}
          <div className="flex items-center gap-2">
            <Grid3X3 className="h-4 w-4" />
            <Switch 
              checked={displayMode === "list"} 
              onCheckedChange={(checked) => setDisplayMode(checked ? "list" : "grid")}
            />
            <List className="h-4 w-4" />
          </div>

          {/* Details toggle */}
          <div className="flex items-center gap-2">
            <Label htmlFor="show-details" className="text-sm">Details</Label>
            <Switch 
              id="show-details"
              checked={showDetails} 
              onCheckedChange={setShowDetails}
            />
          </div>

          {/* Keep existing folder and upload buttons */}
          {(viewMode === "general" || currentViewData.isInFolder) && (
            <Dialog open={folderDialogOpen} onOpenChange={setFolderDialogOpen}>
              <DialogTrigger asChild>
                <Button variant="outline" className="flex items-center gap-2">
                  <FolderPlus className="h-4 w-4" />
                  New Folder
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>
                    Create New Folder
                    {currentViewData.isInFolder && viewMode === "general" && (
                      <span className="text-sm font-normal text-muted-foreground block">
                        in "{currentViewData.folderName}"
                      </span>
                    )}
                  </DialogTitle>
                </DialogHeader>
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="folder-name">Folder Name</Label>
                    <Input
                      id="folder-name"
                      value={newFolderName}
                      onChange={(e) => setNewFolderName(e.target.value)}
                      placeholder="Enter folder name"
                    />
                  </div>
                  <Button onClick={handleCreateFolder} className="w-full">
                    Create Folder
                  </Button>
                </div>
              </DialogContent>
            </Dialog>
          )}
          
          {currentViewData.isInFolder && (
            <Dialog open={uploadDialogOpen} onOpenChange={setUploadDialogOpen}>
              <DialogTrigger asChild>
                <Button className="flex items-center gap-2">
                  <Upload className="h-4 w-4" />
                  Upload Files
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Upload Files to {currentViewData.folderName}</DialogTitle>
                </DialogHeader>
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="file-upload">Select Files</Label>
                    <Input
                      id="file-upload"
                      type="file"
                      multiple
                      onChange={(e) => {
                        if (viewMode === "deals" && currentDealId) {
                          setSelectedDealForUpload(currentDealId);
                        } else if (viewMode === "general" && currentFolderId) {
                          setSelectedFolderForUpload(currentFolderId);
                        }
                        handleFileUpload(e);
                      }}
                      className="mt-1"
                    />
                    <p className="text-xs text-muted-foreground mt-1">Max file size: 5MB</p>
                  </div>
                </div>
              </DialogContent>
            </Dialog>
          )}
        </div>
      </div>

      {/* View mode toggle */}
      {!currentViewData.isInFolder && (
        <div className="flex justify-center">
          <ToggleGroup type="single" value={viewMode} onValueChange={setViewMode} className="bg-muted p-1 rounded-lg">
            <ToggleGroupItem value="deals" className="px-6 py-2">
              <FolderOpen className="mr-2 h-4 w-4" />
              Deals Library
            </ToggleGroupItem>
            <ToggleGroupItem value="general" className="px-6 py-2">
              <FolderOpen className="mr-2 h-4 w-4" />
              General Library
            </ToggleGroupItem>
          </ToggleGroup>
        </div>
      )}

      {/* Search and Filters */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
          <Input
            placeholder={currentViewData.isInFolder ? "Search files..." : `Search ${viewMode === "deals" ? "deals" : "folders"}...`}
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
        
        {/* Sort controls */}
        <div className="flex gap-2">
          <Select value={sortBy} onValueChange={(value: SortOption) => setSortBy(value)}>
            <SelectTrigger className="w-[200px]">
              <Filter className="h-4 w-4 mr-2" />
              <SelectValue placeholder="Sort by" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="name-asc">Name A-Z</SelectItem>
              <SelectItem value="name-desc">Name Z-A</SelectItem>
              <SelectItem value="date-newest">Newest First</SelectItem>
              <SelectItem value="date-oldest">Oldest First</SelectItem>
              {currentViewData.isInFolder && (
                <>
                  <SelectItem value="size-asc">Size (Small to Large)</SelectItem>
                  <SelectItem value="size-desc">Size (Large to Small)</SelectItem>
                </>
              )}
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Stats cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="text-2xl font-bold">
              {viewMode === "deals" ? allFiles.length : generalFiles.length}
            </div>
            <p className="text-sm text-muted-foreground">Total Files</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="text-2xl font-bold">
              {viewMode === "deals" ? deals.length : customFolders.length}
            </div>
            <p className="text-sm text-muted-foreground">
              {viewMode === "deals" ? "Total Deals" : "Custom Folders"}
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="text-2xl font-bold">
              {((viewMode === "deals" ? allFiles : generalFiles).reduce((total, file) => total + file.size, 0) / (1024 * 1024)).toFixed(1)} MB
            </div>
            <p className="text-sm text-muted-foreground">Total Storage</p>
          </CardContent>
        </Card>
      </div>

      {/* Main content area */}
      {currentViewData.isInFolder ? (
        <div className="space-y-6">
          {currentViewData.folders && currentViewData.folders.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <FolderOpen className="h-5 w-5" />
                  Folders
                  <Badge variant="secondary">{currentViewData.folders.length} folders</Badge>
                </CardTitle>
              </CardHeader>
              <CardContent>
                {displayMode === "grid" 
                  ? renderGridView(currentViewData.folders, 'folder')
                  : renderListView(currentViewData.folders, 'folder')
                }
              </CardContent>
            </Card>
          )}

          {currentViewData.files && currentViewData.files.length > 0 ? (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <FileText className="h-5 w-5" />
                  Files
                  <Badge variant="secondary">{currentViewData.files.length} files</Badge>
                </CardTitle>
              </CardHeader>
              <CardContent>
                {displayMode === "grid" 
                  ? renderGridView(currentViewData.files, 'file')
                  : renderListView(currentViewData.files, 'file')
                }
              </CardContent>
            </Card>
          ) : currentViewData.folders && currentViewData.folders.length === 0 ? (
            <Card>
              <CardContent className="p-8 text-center">
                <FolderOpen className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
                <h3 className="text-lg font-medium mb-2">No files or folders found</h3>
                <p className="text-muted-foreground">
                  {searchTerm ? "Try adjusting your search criteria." : "Upload files or create folders to see them here."}
                </p>
              </CardContent>
            </Card>
          ) : null}
        </div>
      ) : (
        currentViewData.folders && currentViewData.folders.length > 0 ? (
          <Card>
            <CardHeader>
              <CardTitle>{viewMode === "deals" ? "Deals" : "Folders"}</CardTitle>
            </CardHeader>
            <CardContent>
              {displayMode === "grid" 
                ? renderGridView(currentViewData.folders, 'folder')
                : renderListView(currentViewData.folders, 'folder')
              }
            </CardContent>
          </Card>
        ) : (
          <Card>
            <CardContent className="p-8 text-center">
              <FolderOpen className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
              <h3 className="text-lg font-medium mb-2">No {viewMode === "deals" ? "deals" : "folders"} found</h3>
              <p className="text-muted-foreground">
                {searchTerm 
                  ? "Try adjusting your search criteria." 
                  : viewMode === "deals" 
                    ? "Create deals to see them here."
                    : "Create folders to organize your files."}
              </p>
            </CardContent>
          </Card>
        )
      )}

      {/* Details Dialog */}
      <Dialog open={detailsDialogOpen} onOpenChange={setDetailsDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              {detailsItem?.type === 'folder' ? (
                <FolderOpen className="h-5 w-5" />
              ) : (
                getFileIcon(detailsItem?.item?.type || "")
              )}
              {detailsItem?.type === 'folder' 
                ? (viewMode === "deals" ? detailsItem.item.title : detailsItem.item.name)
                : detailsItem?.item?.name
              } Details
            </DialogTitle>
          </DialogHeader>
          {detailsItem && (
            <div className="space-y-4">
              {/* Thumbnail */}
              {detailsItem.item.thumbnail && (
                <div className="w-32 h-32 mx-auto">
                  <img 
                    src={detailsItem.item.thumbnail} 
                    alt={detailsItem.type === 'folder' 
                      ? (viewMode === "deals" ? detailsItem.item.title : detailsItem.item.name)
                      : detailsItem.item.name}
                    className="w-full h-full object-cover rounded border"
                  />
                </div>
              )}
              
              {/* Basic Info */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="text-sm font-medium">Name</Label>
                  <p className="text-sm text-muted-foreground">
                    {detailsItem.type === 'folder' 
                      ? (viewMode === "deals" ? detailsItem.item.title : detailsItem.item.name)
                      : detailsItem.item.name
                    }
                  </p>
                </div>
                <div>
                  <Label className="text-sm font-medium">Type</Label>
                  <p className="text-sm text-muted-foreground">
                    {detailsItem.type === 'folder' ? 'Folder' : detailsItem.item.type}
                  </p>
                </div>
                {detailsItem.type === 'file' && (
                  <div>
                    <Label className="text-sm font-medium">Size</Label>
                    <p className="text-sm text-muted-foreground">
                      {formatFileSize(detailsItem.item.size)}
                    </p>
                  </div>
                )}
                <div>
                  <Label className="text-sm font-medium">Created</Label>
                  <p className="text-sm text-muted-foreground">
                    {formatDate(detailsItem.item.createdAt)}
                  </p>
                </div>
                <div>
                  <Label className="text-sm font-medium">Modified</Label>
                  <p className="text-sm text-muted-foreground">
                    {formatDate(detailsItem.item.modifiedAt || detailsItem.item.createdAt)}
                  </p>
                </div>
                <div>
                  <Label className="text-sm font-medium">Created By</Label>
                  <p className="text-sm text-muted-foreground">
                    {detailsItem.item.createdBy || "Unknown"}
                  </p>
                </div>
              </div>

              {/* Privacy Settings */}
              <div className="space-y-2">
                <Label className="text-sm font-medium">Privacy Settings</Label>
                <div className="flex items-center justify-between p-3 border rounded">
                  <div className="flex items-center gap-2">
                    {detailsItem.item.isPrivate ? (
                      <Lock className="h-4 w-4 text-red-500" />
                    ) : (
                      <Users className="h-4 w-4 text-green-500" />
                    )}
                    <span className="text-sm">
                      {detailsItem.item.isPrivate ? "Private" : "Shared"}
                    </span>
                  </div>
                  <Switch 
                    checked={!detailsItem.item.isPrivate}
                    onCheckedChange={(checked) => 
                      handlePrivacyToggle(detailsItem.type, detailsItem.item.id, !checked)
                    }
                  />
                </div>
                <p className="text-xs text-muted-foreground">
                  {detailsItem.item.isPrivate 
                    ? "Only you can access this item" 
                    : "This item is shared with others"
                  }
                </p>
              </div>

              {/* Shared With */}
              {detailsItem.item.sharedWith && detailsItem.item.sharedWith.length > 0 && (
                <div className="space-y-2">
                  <Label className="text-sm font-medium">Shared With</Label>
                  <div className="flex flex-wrap gap-2">
                    {detailsItem.item.sharedWith.map((user: string, index: number) => (
                      <Badge key={index} variant="outline">{user}</Badge>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Dialogs */}
      <Dialog open={thumbnailDialogOpen} onOpenChange={setThumbnailDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Upload Thumbnail for {thumbnailItem?.name}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="thumbnail-upload">Select Thumbnail Image</Label>
              <Input
                id="thumbnail-upload"
                type="file"
                accept="image/*"
                onChange={handleThumbnailUpload}
                className="mt-1"
              />
              <p className="text-xs text-muted-foreground mt-1">
                Image will be automatically resized to 150x150px. Max file size: 2MB.
              </p>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      <Dialog open={shareDialogOpen} onOpenChange={setShareDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Share {shareItem?.type}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label>Shareable Link</Label>
              <div className="flex gap-2 mt-1">
                <Input
                  value={shareItem?.url || ""}
                  readOnly
                  className="flex-1"
                />
                <Button onClick={handleCopyLink} variant="outline" className="flex items-center gap-2">
                  {copiedLink ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                  {copiedLink ? "Copied!" : "Copy"}
                </Button>
              </div>
              <p className="text-xs text-muted-foreground mt-1">
                Share this link to give others access to "{shareItem?.name}"
              </p>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Library;
