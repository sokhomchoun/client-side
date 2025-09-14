import { useState, useEffect, useMemo } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Textarea } from "@/components/ui/textarea";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { TabsContent, Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { toast } from "sonner";
import { Edit, Plus, Trash2, Filter, MoreHorizontal, Pencil,DownloadIcon, Download, Paperclip, ExternalLink, Share2, Copy, Eye, History, Calendar, DollarSign, User, Share2Icon, Upload, Archive } from "lucide-react";
import ContactsImport from "@/components/ContactsImport";
import { useContact } from "@/hooks/useContact";
import { TContact, TUser } from "@/types";
import { Pagination } from "@/components/Pagination";
import { LoadingComponent } from "@/components/LoadingComponent";
import { useHasPermission } from "@/hooks/useHasPermission";
import { Label } from "@/components/ui/label";
import { Link } from "react-router-dom";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

type ContactCategory = {
    id: string;
    name: string;
    color: string;
};

type ContactHistoryEntry = {
    id: string;
    date: string;
    action: string;
    details: string;
    user: string;
};
type Deal = {
    id: string;
    title: string;
    value: number;
    stage: string;
    probability: number;
    closeDate: string;
    status: 'open' | 'won' | 'lost';
    createdAt: string;
};

const Contacts = () => {

    const { 
        handleAddCategory, 
        dataCategories, 
        handleUpdateCategory,
        setIsDialogOpen,
        isDialogOpen,
        setCategoryToEdit,
        categoryToEdit,
        handleDeleteCategory,
        handleAddContact,
        dataContact,
        setDataContact,
        itemsPerPage,
        countPagination,
        setCurrentPage,
        currentPage,
        isDialogContactOpen,
        setIsDialogContactOpen,
        newContact,
        setNewContact,
        loading,
        handleSearchContact,
        searchTerm,
        setSearchTerm,
        handleContactsPerPageChange,
        contactsPerPage,
        handleUpdateContact,
        contactToEdit,
        setContactToEdit,
        handleFileChange,
        selectedNewFiles,
        isEditDialogOpen,
        setIsEditDialogOpen,
        handleDeleteContact,
        handleStartDelete,
        isDeleteDialogOpen,
        setIsDeleteDialogOpen,
        contactToDelete,
        setContactToDelete,
        selectedFiles,
        handleExportContactsCSV,
        handleImport, 
        csvData, 
        setCsvData,  
        isOpen,
        setIsOpen,
        step,
        setStep,
        handleStartShare,
        shareDialogOpen,
        setShareDialogOpen,
        handleShareContact,
        shareEmails,
        setShareEmails,
        permission,
        setPermission,
        auth_id,
        role,
        contactToShare,
        handleDownload,
        uploadProgress,
        isUploadModalOpen,  
        setIsUploadModalOpen,
        dataClient,
        currency,
        user_name,
        handleArchiveContact,
        domain,
        dataTeams,
        form,
        handleTeamToggle,
        setSelectedTeams,
        selectedTeams,
        isUserShared

    } = useContact();

    // hooks HasPermission
    const { hasPermission } = useHasPermission();    

  // Initial categories
    const [categories, setCategories] = useState<ContactCategory[]>([{
        id: "cat-1",
        name: "Client",
        color: "#4f46e5"
    }, {
        id: "cat-2",
        name: "Prospect",
        color: "#10b981"
    }, {
        id: "cat-3",
        name: "Partner",
        color: "#f59e0b"
    }, {
        id: "cat-4",    
        name: "Vendor",
        color: "#6366f1"
    }]);

    const [selectedCategory, setSelectedCategory] = useState<string>("all");
    const [newCategory, setNewCategory] = useState({ name: "", color: "#4f46e5" });
    const [sharedLink, setSharedLink] = useState<string | null>(null);
    
    // New state for export dialog
    const [exportDialogOpen, setExportDialogOpen] = useState(false);
    const [exportFormat, setExportFormat] = useState<'csv' | 'pdf'>('csv');

    const [contactHistoryMap, setContactHistoryMap] = useState<Record<string, ContactHistoryEntry[]>>({});

    // Function to get history entries for a contact
    const getContactHistory = (contactId: string): ContactHistoryEntry[] => {
        return contactHistoryMap[contactId] || [];
    };

    // Function to add a new history entry for a contact
    const addContactHistoryEntry = (contactId: string, entry: ContactHistoryEntry) => {
        setContactHistoryMap(prev => ({
        ...prev,
        [contactId]: [...(prev[contactId] || []), entry],
        }));
    };

    const getWonDeals = (contactId: number | string) => {
        return contactToEdit.deals?.filter(
            deal => deal.pipeline_stage?.name === "Won"
        ) || [];
    };

    // Format currency dynamically
    const formatCurrency = (amount: number, currency: "USD" | "KHR" = "USD") => {
        return new Intl.NumberFormat("en-US", {
            style: "currency",
            currency: currency,
            minimumFractionDigits: 0, // optional: avoid .00 for KHR
        }).format(amount);
    };

    // Filter contacts based on search term and selected category
    const filteredContacts = dataContact.filter(contact => {
        const matchesCategory = selectedCategory === "all" || contact.category_id?.toString() === selectedCategory;
        return matchesCategory;
    });

    const handleCategoryChange = (value: string) => {
        setSelectedCategory(value);
        setCurrentPage(1);
    };

    // Handle form input changes for new contact
    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const {
            name,
            value
        } = e.target;
        setNewContact(prev => ({
            ...prev,
            [name]: value
        }));
    };

    // Handle form input changes for editing contact
    const handleEditChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        if (!contactToEdit) return;
        const {
            name,
            value
        } = e.target;
        setContactToEdit({
            ...contactToEdit,
            [name]: value
        });
    };

    // Format file size
    const formatFileSize = (bytes: number, forceUnit?: 'GB' | 'MB' | 'KB' | 'Bytes'): string => {
        if (bytes === 0) return '0 Bytes';
        const k = 1024;
        const sizes = ['Bytes', 'KB', 'MB', 'GB'];

        if (forceUnit) {
            let index = sizes.indexOf(forceUnit);
            if (index === -1) index = 3; // default to GB if invalid
            return (bytes / Math.pow(k, index)).toFixed(2) + ' ' + sizes[index];
        }

        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return (bytes / Math.pow(k, i)).toFixed(2) + ' ' + sizes[i];
    };

    // Start editing a contact
    const handleStartEdit = (contact: TContact) => {
        setContactToEdit(contact);
        setIsEditDialogOpen(true);
    };

    const handleLocalAddCategory = async () => {
        if (!newCategory.name) {
            toast.error("Please enter a category name");
            return;
        }
        await handleAddCategory(newCategory);
        setIsDialogOpen(false);
    }

    // Handle export based on format
    const handleExport = () => {
        if (exportFormat === 'csv') {
            handleExportContactsCSV();
        } 
        setExportDialogOpen(false);
    };

    const editCategories = (categories) => {
        setCategoryToEdit(categories);
    };

    // add contact
    const onAddContact = async () => {
        try {
            const fullContact: TContact = {
                ...newContact,
                category_id: newContact.category_id,
            };
            await handleAddContact(fullContact, selectedFiles);
        } catch (err) {
            throw err;  
        }
    };

    const handleRemoveAttachment = (id: number) => {
        const updatedAttachments = contactToEdit.contact_attachments?.filter(f => f.id !== id) || [];
        setContactToEdit(prev =>
            prev ? { ...prev, contact_attachments: updatedAttachments } : null
        );
    };

    const isContactLimitReached = useMemo(() => {
        if (!dataClient || dataClient.length === 0) return false;
        const client = dataClient[0];
        const usage = parseInt(client.client_usage?.[0]?.contact_usage || "0", 10);
        const limit = parseInt(client.limited_contact || "0", 10);

        return usage >= limit;
    }, [dataClient]);

    useEffect(() => {
        // display default category first
        if (dataCategories.length > 0 && !newContact.category_id) {
            setNewContact((prev) => ({
                ...prev,
                category_id: dataCategories[0].id.toString(),
            }));
        };
        // set filter paginate display
        if (selectedCategory !== "all" && !dataCategories.some(cat => cat.id.toString() === selectedCategory)) {
            setSelectedCategory("all");
        };

        // activity log contacts
        if (contactToEdit?.id) {
            const currentContact = dataContact.find(c => c.id === contactToEdit.id);

            if (currentContact?.contact_history) {
                currentContact.contact_history.forEach((history) => {
                    addContactHistoryEntry(contactToEdit.id.toString(), {
                        id: history.id.toString(),
                        date: new Date(history.createdAt).toLocaleDateString(),
                        action: history.action,
                        details: history.details,
                        user: history.user?.name
                    });
                });
            }
        }
    }, [dataCategories, newContact.category_id, selectedCategory, contactToEdit?.id, dataContact]);
    
    return (
        <main>
            {/* <LoadingComponent isActive={loading} /> */} 
            {/* loading progress while upload file  */}
            <Dialog open={isUploadModalOpen} onOpenChange={setIsUploadModalOpen}>
                <DialogContent className="w-[300px]">
                    <DialogHeader>
                        <DialogTitle>Uploading Files</DialogTitle>
                        <DialogDescription>
                            Please wait while your files are being uploaded.
                        </DialogDescription>
                    </DialogHeader>
                    <div className="mt-4 flex flex-col items-center space-y-2">
                        <progress value={uploadProgress} max={100} className="w-full" />
                        <span>{uploadProgress}%</span>
                    </div>
                    <DialogFooter>
                        {uploadProgress === 100 && (
                            <Button onClick={() => setIsUploadModalOpen(false)}>Close</Button>
                        )}
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            <div className="px-4 sm:px-6 lg:px-8">
            <h1 className="text-3xl font-bold mb-6">Contacts</h1>
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
                    <div className="flex items-center space-x-2">
                        <Input placeholder="Search contacts..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} 
                            onKeyDown={(e) => {
                                if (e.key === 'Enter') {
                                    handleSearchContact(searchTerm);
                                }
                            }}
                            className="max-w-sm"
                        />
                        <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                                <Button variant="outline" size="icon">
                                    <Filter className="h-4 w-4" />
                                </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                                <Select value={selectedCategory} onValueChange={handleCategoryChange}>
                                    <SelectTrigger className="w-[180px]">
                                        <SelectValue placeholder="Select category" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="all">All Categories</SelectItem>
                                        {dataCategories.map(category => (
                                            <SelectItem key={category.id} value={category.id.toString()}>
                                                <div className="flex items-center">
                                                <span className="w-3 h-3 rounded-full mr-2" style={{ backgroundColor: category?.color }}></span>
                                                    {category.name}
                                                </div>
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </DropdownMenuContent>
                        </DropdownMenu>
                    </div>
                    
                    <div className="flex items-center space-x-2 flex-wrap sm:flex-nowrap gap-2">
                        <div className="flex items-center space-x-2">
                            <span className="text-sm text-muted-foreground">Show:</span>
                            <Select value={contactsPerPage.toString()} onValueChange={handleContactsPerPageChange}>
                                <SelectTrigger className="w-[80px]">
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="10">10</SelectItem>
                                    <SelectItem value="20">20</SelectItem>
                                    <SelectItem value="50">50</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                        
                        <Link to={`/${domain}/pipelines/archive-contacts`}>
                            <Button variant="default" size="sm" className="flex items-center mr-2 gap-2 bg-destructive text-white hover:bg-destructive/90">
                                <Archive className="h-4 w-4" />
                                Archive
                            </Button>
                        </Link>
                        {/* import contacts from excel  */}
                        {hasPermission("contacts.import") && 
                            <ContactsImport
                                categories={categories}
                                handleImport={handleImport}
                                csvData={csvData}
                                setCsvData={setCsvData}
                                isOpen={isOpen}
                                setIsOpen={setIsOpen}
                                step={step}
                                setStep={setStep}
                                loading={loading}
                                dataClient={dataClient}
                            />
                        }

                    <Dialog open={exportDialogOpen} onOpenChange={setExportDialogOpen}>
                        <DialogTrigger asChild>
                            {/* export contacts  */}
                            {hasPermission("contacts.export") && 
                                <Button variant="outline" size="sm">
                                    <Upload className="h-4 w-4 mr-1" />
                                    Export Contacts
                                </Button>
                            }
                        </DialogTrigger>
                        <DialogContent className="sm:max-w-[425px]">
                            <DialogHeader>
                                <DialogTitle>Export Contacts</DialogTitle>
                                <DialogDescription>
                                    Choose the format to export your contacts. This will export {filteredContacts.length} contact(s) based on your current filters.
                                </DialogDescription>
                            </DialogHeader>
                            <div className="space-y-4 py-4">
                                <div className="space-y-2">
                                    <label className="text-sm font-medium">Export Format</label>
                                    <Select value={exportFormat} onValueChange={(value: 'csv' | 'pdf') => setExportFormat(value)}>
                                        <SelectTrigger>
                                            <SelectValue />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="csv">CSV File (.csv)</SelectItem>
                                        </SelectContent>
                                    </Select>
                                    <p className="text-xs text-muted-foreground">
                                        {exportFormat === 'csv' ? 'CSV format is ideal for importing into spreadsheet applications or other contact management systems.' : 'PDF format creates a formatted HTML file that can be printed or viewed in any browser.'}
                                    </p>
                                </div>
                            </div>
                        <DialogFooter>
                            <Button variant="outline" onClick={() => setExportDialogOpen(false)}>
                                Cancel
                            </Button>
                            <Button onClick={handleExport}>
                                <Download className="h-4 w-4 mr-1" />
                                Export {exportFormat.toUpperCase()}
                            </Button>
                        </DialogFooter>
                        </DialogContent>
                    </Dialog>
                    
                    <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                        <DialogTrigger asChild>
                            <Button variant="outline" size="sm">
                                <Edit className="h-4 w-4 mr-1" />
                                Manage Categories
                            </Button>
                        </DialogTrigger>
                        <DialogContent className="sm:max-w-[425px]">
                            <DialogHeader>
                                <DialogTitle>Manage Contact Categories</DialogTitle>
                                <DialogDescription>
                                    Create, edit or delete contact categories.
                                </DialogDescription>
                            </DialogHeader>
                            <div className="space-y-4 my-4">
                                <div className="text-sm font-medium">Current Categories</div>
                                <div className="space-y-2">
                                {dataCategories.map(category => <div key={category.id} className="flex items-center justify-between border-b pb-2">
                                    <div className="flex items-center">
                                        <span className="w-4 h-4 rounded-full mr-2" style={{ backgroundColor: category?.color }}></span>
                                        <span>{category.name}</span>
                                    </div>
                                    <div className="flex space-x-1">
                                        <Button variant="ghost" size="sm" onClick={() => editCategories(category)}>
                                            <Edit className="h-4 w-4" />
                                        </Button>
                                        <Button variant="ghost" size="sm" onClick={() => handleDeleteCategory(category.id)}>
                                            <Trash2 className="h-4 w-4 text-destructive" />
                                        </Button> 
                                    </div>
                                    </div>)}
                                </div>
                            </div>
                        
                            {categoryToEdit ? <div className="space-y-4 border-t pt-4">
                            <h4 className="text-sm font-medium">Edit Category</h4>
                            <div className="space-y-2">
                                <Input placeholder="Category name" value={categoryToEdit.name} onChange={e => setCategoryToEdit({ ...categoryToEdit, name: e.target.value })} />
                                <div className="flex items-center space-x-2">
                                    <label className="text-sm">Color:</label>
                                    <input type="color" value={categoryToEdit.color} onChange={e => setCategoryToEdit({ ...categoryToEdit, color: e.target.value })} className="w-8 h-8 rounded p-0 border-0" />
                                </div>
                                <div className="flex justify-end space-x-2">
                                    <Button variant="outline" size="sm" onClick={() => setCategoryToEdit(null)}>
                                        Cancel
                                    </Button>
                                    <Button size="sm" onClick={() => handleUpdateCategory(categoryToEdit)}>
                                        Update
                                    </Button>
                                </div>
                            </div>
                            </div> : <div className="space-y-4 border-t pt-4">
                            <h4 className="text-sm font-medium">Add New Category</h4>
                            <div className="space-y-2">
                                <Input placeholder="Category name" value={newCategory.name} onChange={e => setNewCategory({ ...newCategory, name: e.target.value })} />
                                <div className="flex items-center space-x-2">
                                    <label className="text-sm">Color:</label>
                                    <input type="color" value={newCategory.color} onChange={e => setNewCategory({...newCategory, color: e.target.value })} className="w-8 h-8 rounded p-0 border-0" />
                                </div>
                                <Button onClick={handleLocalAddCategory} className="w-full">
                                    <Plus className="h-4 w-4 mr-1" />
                                    Add Category
                                </Button>
                            </div>
                            </div>}
                        </DialogContent>
                    </Dialog>
                    
                    <Dialog open={isDialogContactOpen} onOpenChange={setIsDialogContactOpen}>
                        {/* <DialogTrigger asChild> */}
                        {hasPermission("contacts.create") && (
                            <Button
                                onClick={() => {
                                    if (isContactLimitReached) {
                                        toast.error("You have reached your contact limit. Please upgrade your plan.");
                                        return;
                                    }
                                    setIsDialogContactOpen(true);
                                }}
                            >
                                <Plus className="h-4 w-4 mr-1" />
                                Add Contact
                            </Button>
                        )}
                        {/* </DialogTrigger> */}
                        <DialogContent className="sm:max-w-[700px] max-h-[90vh] overflow-y-auto">
                            <DialogHeader>
                                <DialogTitle>Add New Contact</DialogTitle>
                                <DialogDescription>
                                Enter the contact information below.
                                </DialogDescription>
                            </DialogHeader>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 py-4">
                                <div className="space-y-2">
                                    <label className="text-sm font-medium">Name*</label>
                                    <Input name="name" value={newContact.name} onChange={handleInputChange} placeholder="Full name" />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-sm font-medium">Email*</label>
                                    <Input name="email" type="email" value={newContact.email} onChange={handleInputChange} placeholder="Email address" />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-sm font-medium">Phone</label>
                                    <Input name="phone" value={newContact.phone} onChange={handleInputChange} placeholder="Phone number" />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-sm font-medium">Company*</label>
                                    <Input name="company" value={newContact.company} onChange={handleInputChange} placeholder="Company name" />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-sm font-medium">Position</label>
                                    <Input name="position" value={newContact.position} onChange={handleInputChange} placeholder="Job title" />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-sm font-medium">Website</label>
                                    <Input name="website" value={newContact.website || ''} onChange={handleInputChange} placeholder="https://company.com" />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-sm font-medium">Category</label>
                                    <Select value={newContact.category_id} onValueChange={(value) => setNewContact((prev) => ({ ...prev, category_id: value }))}>
                                        <SelectTrigger>
                                            <SelectValue placeholder="Select a category" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {dataCategories.map((category) => (
                                                <SelectItem key={category.id} value={category.id.toString()}>
                                                    <div className="flex items-center">
                                                        <span className="w-3 h-3 rounded-full mr-2" style={{ backgroundColor: category?.color }}></span>
                                                        {category.name}
                                                    </div>
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                </div>
                                <div className="space-y-2 md:col-span-2">
                                    <label className="text-sm font-medium">Address</label>
                                    <Input name="address" value={newContact.address || ''} onChange={handleInputChange} placeholder="Full address" />
                                </div>
                                <div className="space-y-2 md:col-span-2">
                                    <label className="text-sm font-medium">Google Maps Link</label>
                                    <Input name="map_link" value={newContact.map_link || ''} onChange={handleInputChange} placeholder="https://maps.google.com/?q=your+address" />
                                <p className="text-xs text-muted-foreground mt-1">
                                    Create a link by going to Google Maps, searching for the address, and copying the URL.
                                </p>
                                </div>
                                <div className="space-y-2 md:col-span-2">
                                    <label className="text-sm font-medium">Notes</label>
                                    <Textarea name="notes" value={newContact.notes || ''} onChange={handleInputChange} placeholder="Additional notes about this contact..." rows={4} className="resize-none" />
                                </div>
                                <div className="space-y-2 md:col-span-2">
                                    <label className="text-sm font-medium">Attach Files</label>
                                    <Input type="file" multiple onChange={handleFileChange} className="cursor-pointer" />
                                <p className="text-xs text-muted-foreground mt-1">
                                    You can attach multiple files (documents, images, etc.)
                                </p>
                                    {selectedFiles && (
                                        <div className="mt-2 space-y-1">
                                            {Array.from(selectedFiles).map((file, index) => (
                                            <div key={index} className="flex items-center text-sm text-muted-foreground">
                                                <Paperclip className="h-3 w-3 mr-1" />
                                                {file.name} ({formatFileSize(file.size)})
                                            </div>
                                            ))}
                                        </div>
                                        )}
                                </div>
                            </div>
                        <DialogFooter>
                            <Button onClick={onAddContact}>
                                Add Contact
                            </Button>
                        </DialogFooter>
                        </DialogContent>
                    </Dialog>
                    </div>
                </div>
            
            {/* Edit Contact Dialog with updated history tab */}
            <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
                <DialogContent className="sm:max-w-[900px] max-h-[90vh] overflow-hidden p-[13px] gap-0">
                <DialogHeader>
                    <DialogTitle>Contact Details</DialogTitle>
                    <DialogDescription>
                    View and edit contact information, history, and associated deals.
                    </DialogDescription>
                </DialogHeader>
                
                    {contactToEdit && <Tabs defaultValue="details" className="w-full">
                        <TabsList className="grid w-full grid-cols-4">
                            <TabsTrigger value="details">Contact Details</TabsTrigger>
                            <TabsTrigger value="history">Activity Log</TabsTrigger>
                            <TabsTrigger value="deals">Active Deals</TabsTrigger>
                            <TabsTrigger value="won-deals">Won Deals</TabsTrigger>
                        </TabsList>
                    
                    <TabsContent value="details" className="max-h-[70vh] overflow-y-auto">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 py-4">
                        <div className="space-y-2">
                            <label className="text-sm font-medium">Name*</label>
                            <Input name="name" value={contactToEdit.name} onChange={handleEditChange} placeholder="Full name" />
                        </div>
                        <div className="space-y-2">
                            <label className="text-sm font-medium">Email*</label>
                            <Input name="email" type="email" value={contactToEdit.email} onChange={handleEditChange} placeholder="Email address" />
                        </div>
                        <div className="space-y-2">
                            <label className="text-sm font-medium">Phone</label>
                            <Input name="phone" value={contactToEdit.phone} onChange={handleEditChange} placeholder="Phone number" />
                        </div>
                        <div className="space-y-2">
                            <label className="text-sm font-medium">Company*</label>
                            <Input name="company" value={contactToEdit.company} onChange={handleEditChange} placeholder="Company name" />
                        </div>
                        <div className="space-y-2">
                            <label className="text-sm font-medium">Position</label>
                            <Input name="position" value={contactToEdit.position} onChange={handleEditChange} placeholder="Job title" />
                        </div>
                        <div className="space-y-2">
                            <label className="text-sm font-medium">Website</label>
                            <Input name="website" value={contactToEdit.website || ''} onChange={handleEditChange} placeholder="https://company.com" />
                        </div>
                        <div className="space-y-2">
                            <label className="text-sm font-medium">Category</label>
                            <Select value={contactToEdit.category_id?.toString() || ''} 
                                onValueChange={value =>  setContactToEdit(prev => prev ? { ...prev, category_id: value } : null) }>
                                <SelectTrigger>
                                    <SelectValue placeholder="Select category" />
                                </SelectTrigger>
                                <SelectContent>
                                    {dataCategories.map(category => (
                                        <SelectItem key={category.id} value={category.id.toString()}>
                                            <div className="flex items-center">
                                            <span className="w-3 h-3 rounded-full mr-2" style={{ backgroundColor: category?.color }}/>
                                                {category.name}
                                            </div>
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>
                            <div className="space-y-2 md:col-span-2">
                                <label className="text-sm font-medium">Address</label>
                                <Input name="address" value={contactToEdit.address || ''} onChange={handleEditChange} placeholder="Full address" />
                            </div>
                            <div className="space-y-2 md:col-span-2">
                                <label className="text-sm font-medium">Google Maps Link</label>
                                <Input name="map_link" value={contactToEdit.map_link || ''} onChange={handleEditChange} placeholder="https://maps.google.com/?q=your+address" />
                                <p className="text-xs text-muted-foreground mt-1">
                                    Create a link by going to Google Maps, searching for the address, and copying the URL.
                                </p>
                            </div>
                            <div className="space-y-2 md:col-span-2">
                                <label className="text-sm font-medium">Notes</label>
                                <Textarea name="notes" value={contactToEdit.notes || ''} onChange={handleEditChange} placeholder="Additional notes about this contact..." rows={4} className="resize-none" />
                            </div>

                        {contactToEdit.contact_attachments && contactToEdit.contact_attachments.length > 0 && (
                            <div className="space-y-2 md:col-span-2">
                                <label className="text-sm font-medium">Current Attachments</label>
                                <div className="space-y-1">
                                    {contactToEdit.contact_attachments.map((file) => {
                                        const sizeNum = parseFloat(file.file_size);
                                        const unit = file.file_size_unit || 'Bytes'
                                        let bytes = 0;
                                        switch (unit) {
                                            case 'GB':
                                                bytes = sizeNum * 1024 ** 3;
                                                break;
                                            case 'MB':
                                                bytes = sizeNum * 1024 ** 2;
                                                break;
                                            case 'KB':
                                                bytes = sizeNum * 1024;
                                                break;
                                            case 'Bytes':
                                            default:
                                                bytes = sizeNum;
                                                break;
                                        }
                                        return (
                                            <div key={file.id} className="flex items-center justify-between p-2 bg-muted rounded">
                                                <div className="flex items-center text-sm">
                                                    <Paperclip className="h-4 w-4 mr-2" />
                                                    {file.file_name} ({formatFileSize(bytes)})
                                                </div>
                                                <div>
                                                    <Button 
                                                        onClick={(e) => {
                                                            e.preventDefault();
                                                            const downloadUrl = `${window.location.origin}/download-file?url=${encodeURIComponent(file.file_url)}&name=${encodeURIComponent(file.file_name)}`;
                                                            window.open(downloadUrl, "_blank");
                                                        }}
                                                        className="mr-1" variant="ghost" size="sm">
                                                        <Share2Icon className="h-4 w-4" />
                                                    </Button>
                                                    <Button variant="ghost" size="sm" onClick={() => handleRemoveAttachment(file.id)}>
                                                        <Trash2 className="h-4 w-4" />
                                                    </Button>
                                                </div>
                                               
                                            </div>
                                        );
                                    })}
                                </div>
                            </div>
                        )}
                        <div className="space-y-2 md:col-span-2">
                            <label className="text-sm font-medium">Attach Files</label>
                            <Input type="file" multiple onChange={handleFileChange} className="cursor-pointer" />
                            {selectedNewFiles && selectedNewFiles.map((file, index) => (
                                <div key={index} className="flex items-center text-sm text-muted-foreground">
                                    <Paperclip className="h-3 w-3 mr-1" />
                                    {file.name} ({formatFileSize(file.size)})
                                </div>
                            ))}
                        </div>
                        </div>
                    </TabsContent>
                    
                    <TabsContent value="history" className="max-h-[70vh] overflow-y-auto">
                        <Card>
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2">
                                <History className="h-5 w-5" />
                                    Activity Log
                                </CardTitle>
                                <CardDescription>
                                    History of changes and activities for this contact
                                </CardDescription>
                            </CardHeader>
                            <CardContent>
                                <div className="space-y-4">
                                    {getContactHistory(contactToEdit.id.toString()).map((entry, index) => <div key={entry.id} className="flex items-start space-x-3 pb-4 border-b last:border-b-0">
                                        <div className="flex-shrink-0 w-2 h-2 bg-blue-500 rounded-full mt-2"></div>
                                        <div className="flex-1 min-w-0">
                                            <div className="flex items-center justify-between">
                                                <p className="font-medium text-sm">{entry.action}</p>
                                                <span className="text-xs text-muted-foreground flex items-center gap-1"><Calendar className="h-3 w-3" />
                                                    {entry.date}
                                                </span>
                                            </div>
                                            <p className="text-sm text-muted-foreground mt-1">{entry.details}</p>
                                            <p className="text-xs text-muted-foreground mt-2 flex items-center gap-1">
                                            <User className="h-3 w-3" />
                                                {entry.user}
                                            </p>
                                        </div>
                                    </div>)}
                                </div>
                                {getContactHistory(contactToEdit.id.toString()).length === 0 && <div className="text-center py-8 text-muted-foreground">
                                    <History className="h-12 w-12 mx-auto mb-4 opacity-50" />
                                    <p>No activity history available</p>
                                    <p className="text-sm">Activities will appear here as you interact with this contact</p>
                                </div>}
                            </CardContent>
                        </Card>
                    </TabsContent>
                    
                    <TabsContent value="deals" className="max-h-[70vh] overflow-y-auto">
                        <Card>
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2">
                                    <DollarSign className="h-5 w-5" />
                                    Active Deals
                                </CardTitle>
                                <CardDescription>
                                    Current deals and opportunities with this contact
                                </CardDescription>
                            </CardHeader>
                            <CardContent>
                                <div className="space-y-4">
                                    {contactToEdit.deals?.map((deal) => (
                                        <div key={deal.id} className="border rounded-lg p-4">
                                            <div className="flex items-center justify-between mb-2">
                                                <h4 className="font-medium">{deal.title}</h4>
                                                <span className="text-lg font-semibold text-green-600">
                                                    {currency === "USD" ? formatCurrency(deal.value_usd, "USD") : formatCurrency(deal.value_khr, "KHR")}
                                                </span>
                                            </div>
                                            <div className="grid grid-cols-2 gap-4 text-sm">
                                                <div>
                                                    <span className="text-muted-foreground">Stage:</span>
                                                    <span className="ml-2 font-medium">{deal.pipeline_stage?.name}</span>
                                                </div>
                                                <div>
                                                    <span className="text-muted-foreground">Probability:</span>
                                                    <span className="ml-2 font-medium">
                                                    {deal.pipeline_stage?.probability}%
                                                    </span>
                                                </div>
                                                <div>
                                                    <span className="text-muted-foreground">Close Date:</span>
                                                    <span className="ml-2">
                                                    {new Date(deal.expected_close_date).toLocaleDateString()}
                                                    </span>
                                                </div>
                                                <div>
                                                    <span className="text-muted-foreground">Created:</span>
                                                    <span className="ml-2">
                                                    {new Date(deal.createdAt).toLocaleDateString()}
                                                    </span>
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </CardContent>
                        </Card>
                    </TabsContent>
                    
                    <TabsContent value="won-deals" className="max-h-[70vh] overflow-y-auto">
                        <Card>
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2">
                                    <DollarSign className="h-5 w-5 text-green-600" />
                                    Won Deals
                                </CardTitle>
                                <CardDescription>
                                    Successfully closed deals with this contact
                                </CardDescription>
                            </CardHeader>

                            <CardContent>
                                <div className="space-y-4">
                                    {getWonDeals(contactToEdit.id).map(deal => (
                                    <div key={deal.id} className="border rounded-lg p-4">
                                        <div className="flex items-center justify-between mb-2">
                                            <h4 className="font-medium">{deal.title}</h4>
                                            <span className="text-lg font-semibold text-green-600">
                                                {currency === "USD" ? formatCurrency(deal.value_usd, "USD") : formatCurrency(deal.value_khr, "KHR")}
                                            </span>
                                        </div>
                                        <div className="grid grid-cols-2 gap-4 text-sm">
                                            <div>
                                                <span className="text-muted-foreground">Status:</span>
                                                <span className="ml-2 font-medium text-green-600">Won</span>
                                            </div>
                                            <div>
                                                <span className="text-muted-foreground">Closed Date:</span>
                                                <span className="ml-2">{new Date(deal.expected_close_date).toLocaleDateString()}</span>
                                            </div>
                                            <div>
                                                <span className="text-muted-foreground">Created:</span>
                                                <span className="ml-2">{new Date(deal.createdAt).toLocaleDateString()}</span>
                                            </div>
                                        </div>
                                    </div>
                                    ))}

                                    {/* Total Won Revenue */}
                                    <div className="border-t pt-4 mt-4">
                                    <div className="text-right">
                                        <span className="text-sm text-muted-foreground">Total Won Revenue:</span>
                                        <span className="ml-2 text-lg font-semibold text-green-600">
                                        {formatCurrency(
                                            getWonDeals(contactToEdit.id).reduce((sum, deal) => sum + (currency === "USD" ? deal.value_usd : deal.value_khr), 0), currency === "USD" ? "USD" : "KHR"
                                        )}
                                        </span>
                                    </div>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    </TabsContent>
                    </Tabs>}
                
                    <DialogFooter className="pb-6 mt-3">
                        <Button variant="outline" onClick={() => setIsEditDialogOpen(false)}>Close</Button>
                        <Button onClick={handleUpdateContact}>Update Contact</Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            {/* Share Contact Dialog */}
            <Dialog open={shareDialogOpen} onOpenChange={setShareDialogOpen}>
                <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                    <DialogTitle>Share Contact</DialogTitle>
                    <DialogDescription>
                        Share "{contactToShare?.name}" with team members
                    </DialogDescription>
                </DialogHeader>
                <div className="space-y-4 py-4">
                    <div className="space-y-2">
                        <label className="text-sm font-medium">Share with (email addresses)</label>
                            <FormField control={form.control} name="name" render={({ field }) => (
                                <FormItem>
                                    <div className="border rounded-md p-3">
                                        {dataTeams.length > 0 ? (
                                            <div className="flex flex-wrap gap-2">
                                                {dataTeams.map((user) => (
                                                    <Badge key={user.id}  variant={isUserShared(user.id) ? "default" : "outline"} onClick={() => handleTeamToggle(user.id, user.domain, user.email)}>
                                                        <Avatar className="h-4 w-4 mr-1">
                                                            <AvatarImage src={user?.avatar} />
                                                            <AvatarFallback className="bg-[#061439] text-white">{user?.name.charAt(0)}</AvatarFallback>
                                                        </Avatar>
                                                        {user.email}
                                                        {isUserShared(user.id) && <span className="ml-1 text-xs">✓</span>}
                                                    </Badge>
                                                ))}
                                            </div>
                                        ) : (
                                            <p className="text-sm text-muted-foreground">No users available</p>
                                        )}
                                    </div>
                                <FormMessage />
                                </FormItem>
                            )} />
                    </div>
                </div>
                <div className="space-y-2">
                    <label className="text-sm font-medium">Permissions</label>
                    <div className="flex space-y-1 gap-3">
                        <label className="flex items-center space-x-2">
                            <input className="accent-[#FC8889]" type="radio" name="permission" value="read" checked={permission === 'read'} onChange={() => setPermission('read')}/>
                            <span className="text-xs font-medium">View Only</span>
                        </label>
                        <label className="flex items-center space-x-2">
                            <input className="accent-[#FC8889]" type="radio" name="permission" value="full" checked={permission === 'full'} onChange={() => setPermission('full')}/>
                            <span className="text-xs font-medium">Full Permission</span>
                        </label>
                    </div>
                </div>

                <DialogFooter>
                    <Button variant="outline" onClick={() => setShareDialogOpen(false)}>Cancel</Button>
                    <Button onClick={handleShareContact}>
                        {contactToShare?.contact_sharing?.length > 0 ? "Update Sharing" : "Sharing"}
                    </Button>
                </DialogFooter>
                </DialogContent>
            </Dialog>
            
            <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                        <AlertDialogDescription>
                        This will permanently delete the contact {contactToDelete?.name}. This action cannot be undone.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                <AlertDialogFooter>
                    <AlertDialogCancel onClick={() => setContactToDelete(null)}>Cancel</AlertDialogCancel>
                    <AlertDialogAction className="bg-destructive text-destructive-foreground hover:bg-destructive/90" onClick={handleDeleteContact}>
                        Delete
                    </AlertDialogAction>
                </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
            
            <Card>
                <CardContent className="p-0">
                <Table>
                    <TableHeader>
                    <TableRow>
                        <TableHead>Name</TableHead>
                        <TableHead>Company</TableHead>
                        <TableHead>Email</TableHead>
                        <TableHead>Phone</TableHead>
                        <TableHead>Category</TableHead>
                        <TableHead>Owner</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead className="w-[140px] pr-6">Actions</TableHead>
                    </TableRow>
                    </TableHeader>
                    <TableBody>
                    {filteredContacts.map(contact => {
                        const isOwner = contact.user_id === auth_id;
                        const sharedPermission = contact.contact_sharing?.find(share => share.shared_with_user_id === auth_id)?.permissions;
                        const isAdmin = role === "admin";
                        const canView = isAdmin || isOwner || sharedPermission === "read" || sharedPermission === "full";
                        const canShare = isAdmin || isOwner || sharedPermission === "full";
                        const canDelete = isAdmin || isOwner || sharedPermission === "full";

                        return (
                            <TableRow key={contact.id}>
                                <TableCell className="font-medium">{contact.name}</TableCell>
                                <TableCell>{contact.company}</TableCell>
                                <TableCell>{contact.email}</TableCell>
                                <TableCell>{contact.phone}</TableCell>
                                <TableCell>
                                    <div className="flex items-center">
                                        <span className="w-3 h-3 rounded-full mr-2" style={{ backgroundColor: contact.contact_category?.color }}></span>
                                        {contact.contact_category?.name}
                                    </div>
                                </TableCell>
                                <TableCell>
                                    <div className="flex items-center">
                                        {contact.user.name}
                                    </div>
                                </TableCell>
                                <TableCell>
                                    {contact.is_shared ? (
                                        contact.user_id === auth_id ? (
                                            <div className="flex items-center text-green-600">
                                                <Share2 className="h-3 w-3 mr-1" /> Shared
                                            </div>
                                            ) : (
                                            <div className="flex items-center text-blue-600">
                                                <Share2 className="h-3 w-3 mr-1" /> Sharing
                                            </div>
                                        )
                                    ) : (
                                        <span className="text-muted-foreground">Private</span>
                                    )}
                                </TableCell>

                                <TableCell className="pr-6">
                                    <div className="flex items-center">
                                        {canView && hasPermission("contacts.view") && (
                                            <Button variant="ghost" size="sm" onClick={() => handleStartEdit(contact)} title="View/Edit Contact">
                                                <Eye className="h-4 w-4" />
                                            </Button>
                                        )}
                                        {canShare && hasPermission("contacts.share") && (
                                            <Button variant="ghost" size="sm" onClick={() => handleStartShare(contact)} title="Share Contact">
                                                <Share2 className="h-4 w-4" />
                                            </Button>
                                        )}
                                        <Button variant="ghost" size="sm" onClick={() => handleArchiveContact(contact.id)} title="Archive">
                                            <Archive className="h-4 w-4" />
                                        </Button>
                                        {canDelete && hasPermission("contacts.delete") && (
                                            <Button variant="ghost" size="sm" onClick={() => handleStartDelete(contact)} className="text-destructive hover:text-destructive" title="Delete Contact">
                                                <Trash2 className="h-4 w-4" />
                                            </Button>
                                        )}
                                    </div>
                                </TableCell>
                            </TableRow>
                        );
                    })}
                    </TableBody>
                </Table>
                </CardContent>
            </Card>

            {/* Pagination  */}
            <Pagination
                currentPage={currentPage}
                totalCount={countPagination}
                itemsPerPage={itemsPerPage}
                onPageChange={(page) => setCurrentPage(page)}
            />
            </div>
        </main>
    )


};

export default Contacts;
