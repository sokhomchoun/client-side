import axios from "axios";
import { ProvideToken, AuthId, User } from "@/tokens/token";
import { toast } from "@/components/ui/sonner";
import { useState, useEffect } from "react";
import { TContactCategories, TContact, TClient } from "@/types";
import { Authorizations } from "@/utils/Authorization";
import { Currency } from "@/tokens/currency";
import socketService from "@/services/websocket/Socket.Service";
import { useForm } from "react-hook-form";

type CSVRow = { [key: string]: string };
type FormValues = {
    id: number;
    name: string;
    email: string;
};

export function useContact() {

    const token = ProvideToken();
    const auth_id = AuthId();
    const { role, domain, client_id, user_name} = User();
    const { currency } = Currency();
    const [loading, setLoading] = useState<boolean>(false);
    const [dataCategories, setDataCategories] = useState<TContactCategories[]>([]);
    const [isDialogOpen, setIsDialogOpen] = useState(false);
    const [categoryToEdit, setCategoryToEdit] = useState<TContactCategories | null>(null);
    const [dataContact, setDataContact] = useState<TContact[]>([]);
    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 10;
    const [countPagination, setCountPagination] = useState<number>(0);
    const [isDialogContactOpen, setIsDialogContactOpen] = useState(false);
    const [searchTerm, setSearchTerm] = useState<string>('');
    const [contactsPerPage, setContactsPerPage] = useState(10);
    const [contactToEdit, setContactToEdit] = useState<TContact | null>(null);
    const [selectedNewFiles, setSelectedNewFiles] = useState<File[]>([]);
    const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
    const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
    const [contactToDelete, setContactToDelete] = useState<TContact | null>(null);
    const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
    const [csvData, setCsvData] = useState<CSVRow[]>([]);
    const [isOpen, setIsOpen] = useState(false);
    const [step, setStep] = useState<'upload' | 'mapping' | 'preview'>('upload');
    const [shareDialogOpen, setShareDialogOpen] = useState(false);
    const [contactToShare, setContactToShare] = useState<TContact | null>(null);
    const [shareEmails, setShareEmails] = useState<string>("");
    const [permission, setPermission] = useState<'read' | 'full'>('read');
    const [commitEmail, setCommitEmail] = useState<number[]>([]);
    const [uploadProgress, setUploadProgress] = useState(0);
    const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);
    const [dataClient, setDataClient] = useState<TClient[]>([]);
    const [dataTeams, setDataTeams] = useState<any[]>([]);
    const [selectedTeams, setSelectedTeams] = useState<{ id: number; domain: string; email: string }[]>([]);

    const form = useForm<FormValues>({
        defaultValues: {
            id: null,
            name: null,
            email: null
        },
    });
    
    const [newContact, setNewContact] = useState<any>({
        name: '',
        client_id: client_id,
        domain: domain,
        user_id: auth_id,
        role: role,
        email: '',
        phone: '',
        company: '',
        position: '',
        category_id: '',
        address: '',
        map_link: '',
        website: '',
        notes: '',
    });

    const handleGetClientPermission = async () => {
        try {
            setLoading(true);
            const payload = { domain: domain }
            const response = await axios.get(`haspermission/client/${auth_id}`, {
                params: payload,
                headers: Authorizations(token)
            });
            if (response.status === 200) {
                setDataClient(response.data.data)
                setLoading(false);
            }
        } catch (err) {
            const errorMessage = err?.response?.data?.error || err?.response?.data?.message || "An unexpected error occurred.";
            toast.error(errorMessage);
            setLoading(false);
        }
    };

    const handleAddCategory = async (data: { name: string, color: string }) => {
        try {
            const payload = {
                domain: domain,
                client_id: client_id,
                auth_id: auth_id,
                role: role,
                name: data.name,
                color: data.color
            }
            const respnose = await axios.post('contact/categories', payload, {
                headers: Authorizations(token) 
            });
            if (respnose.status === 201) {
                toast.success(respnose.data.data.message);
                handleGetCategories();
            }
        } catch (err) {
            const errorMessage = err?.response?.data?.error || err?.response?.data?.message || "An unexpected error occurred.";
            toast.error(errorMessage);
        }
    };

    const handleGetCategories = async () => {
        try {
            setLoading(true);
            const payload = {
                domain: domain
            }
            const response = await axios.get(`contact/categories/${auth_id}`, {
                params: payload,
                headers: Authorizations(token)
            });
            if (response.status === 200) {
                setDataCategories(response.data.data);
                setLoading(false);
            }
        } catch (err) {
            const errorMessage = err?.response?.data?.error || err?.response?.data?.message || "An unexpected error occurred.";
            toast.error(errorMessage);
            setLoading(false);
        }
    };

    const handleUpdateCategory = async (category: TContactCategories) => {
        try {
            const payload = { name: category.name, color: category.color }
            const response = await axios.put(`contact/categories/${category.id}`, payload, {
                headers: Authorizations(token)
            });
            if (response.status === 200) {
                toast.success(response.data.data.message);
                await handleGetCategories();
                setCategoryToEdit(null);             
                setIsDialogOpen(false);  
            }
        } catch (err) {
            const errorMessage = err?.response?.data?.error || err?.response?.data?.message || "An unexpected error occurred.";
            toast.error(errorMessage);
        }
    };

    const handleDeleteCategory = async (id: number) => {
        try {
            const response = await axios.delete(`contact/categories/${id}`,{
                headers: Authorizations(token)
            });
            if (response.status === 200) {
                toast.success(response.data.data.message);
                setIsDialogOpen(false);
                handleGetCategories();
            }
        } catch (err) {
            const errorMessage = err?.response?.data?.error || err?.response?.data?.message || "An unexpected error occurred.";
            toast.error(errorMessage);
        }
    };

    const handleAddContact = async (contact: TContact, files: File[] | null) => {
        try {
            const form = new FormData();

            Object.entries(contact).forEach(([key, value]) => {
                if (value !== undefined && value !== null) {
                    if (Array.isArray(value) || typeof value === 'object') {
                        form.append(key, JSON.stringify(value));
                    } else {
                        form.append(key, value as string);
                    }
                }
            });

            if (files && files.length > 0) {
                files.forEach(file => {
                    form.append('attachments', file);
                });
            }

            setIsUploadModalOpen(true);
            setUploadProgress(0);

            const response = await axios.post('/contact', form, {
                headers: Authorizations(token),
                onUploadProgress: (progressEvent) => {
                    let percentCompleted = Math.round(
                        (progressEvent.loaded * 100) / (progressEvent.total ?? 1)
                    );
                    // Cap the progress at 97% until response finishes
                    if (percentCompleted >= 100) {
                        percentCompleted = 97;
                    }
                    setUploadProgress(percentCompleted);
                },
            });

            if (response.status === 201) {
                setUploadProgress(100);
                await new Promise(res => setTimeout(res, 300));

                toast.success(response.data.data.message);
                handleGetContact();
                setIsDialogContactOpen(false);
                setSelectedNewFiles([]);
                setSelectedFiles([]);
                setNewContact({
                    name: '',
                    client_id: client_id,
                    domain: domain,
                    user_id: auth_id,
                    role: role,
                    email: '',
                    phone: '',
                    company: '',
                    position: '',
                    category_id: '',
                    address: '',
                    map_link: '',
                    website: '',
                    notes: '',
                    contact_sharing: []
                });
                setIsUploadModalOpen(false);
                setUploadProgress(0); // reset after modal close or after UI clears progress bar
            }
        } catch (err: any) {
            const errorMessage = err?.response?.data?.error || err?.response?.data?.message || "An unexpected error occurred.";
            toast.error(errorMessage);
            setUploadProgress(0);
            setIsUploadModalOpen(false);
        }
    };

    // import contacts 
    const handleImport = async () => {
        try {
            setLoading(true);
            const invalidContacts = csvData.filter(contact =>
                !contact.email || !contact.phone || !contact.category
            );
            if (invalidContacts.length > 0) {
                toast.error("Some contacts are missing required fields: email, phone, or category.");
                return;
            }
            const data = JSON.stringify(csvData);
            const payload = {
                client_id: client_id,
                domain: domain,
                user_id: auth_id,
                role: role,
                contacts: data
            };
            const response = await axios.post('contact/import', payload, {
                headers: Authorizations(token)
            });

            if (response.status === 201 || response.status === 200) {
                const message = response.data?.data?.message;
                toast.success(message);
                setIsOpen(false);
                setCsvData([]);
                handleGetContact();
                setStep('upload');
                
                if (!message.toLowerCase().includes('no new contacts')) {
                    window.location.reload();
                }
                setLoading(false);
            }
        } catch (err) {
            const errorMessage = err?.response?.data?.error || err?.response?.data?.message || "An unexpected error occurred.";
            toast.error(errorMessage);
            setLoading(false);
        }
    };

    const handleGetContact = async (page = 1, search?: string) => {
        try {
            setLoading(true);
            const payload = {
                page: page,
                limit: contactsPerPage,
                search: search || searchTerm || '',
                domain: domain
            };
            const response = await axios.get(`contact/${auth_id}`, {
                params: payload,
                headers: Authorizations(token)
            });
            if (response.status === 200) {
                setDataContact(response.data.data.contact);
                setCountPagination(response.data.data.paginations.total);
                setCurrentPage(response.data.data.paginations.currentPage);
                setLoading(false);
            }
        } catch (err) {
            const errorMessage = err?.response?.data?.error || err?.response?.data?.message || "An unexpected error occurred.";
            toast.error(errorMessage);
            setLoading(false);
        } 
    };

    const handleSearchContact = async (value: string) => {
        try {
            await handleGetContact(currentPage, value);
        } catch (err) {
            console.error('Search failed:', err);
        }
    };

    const handleContactsPerPageChange = (value: string) => {
        const newLimit = parseInt(value);
        setContactsPerPage(newLimit);
        setCurrentPage(1);
        handleGetContact(1, searchTerm);
    };

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const files = e.target.files;
        if (!files || files.length === 0) return;

        const filesArray = Array.from(files);
        setSelectedNewFiles(filesArray);
        setSelectedFiles(filesArray);
    };

    const handleUpdateContact = async () => {
        if (!contactToEdit || !contactToEdit.id) return;
        try {
            const form = new FormData();

            form.append("name", contactToEdit.name);
            form.append("email", contactToEdit.email);
            form.append("user_id", contactToEdit.user_id.toString());
            form.append("phone", contactToEdit.phone);
            form.append("company", contactToEdit.company);
            form.append("position", contactToEdit.position);
            form.append("category_id", contactToEdit.category_id || "");
            form.append("address", contactToEdit.address || "");
            form.append("website", contactToEdit.website || "");
            form.append("notes", contactToEdit.notes || "");
            form.append("map_link", contactToEdit.map_link || "");
            form.append("client_id", client_id);
            form.append("domain", domain);
            // Add new files
            selectedNewFiles.forEach((file, index) => {
                form.append(`attachments`, file);
            });
            setIsUploadModalOpen(true);
            setUploadProgress(0);

            const response = await axios.put(`contact/${contactToEdit.id}`, form, {
                headers: Authorizations(token),
                onUploadProgress: (progressEvent) => {
                    let percentCompleted = Math.round(
                        (progressEvent.loaded * 100) / (progressEvent.total ?? 1)
                    );
                    // Cap the progress at 97% until response finishes
                    if (percentCompleted >= 100) {
                        percentCompleted = 97;
                    }
                    setUploadProgress(percentCompleted);
                },
            });
            if (response.status === 200) {
                setUploadProgress(100);
                await new Promise(res => setTimeout(res, 300));

                setSelectedNewFiles([]);
                setIsEditDialogOpen(false);
                setIsDialogContactOpen(false);
                setSelectedFiles([]);
                handleGetContact();
                toast.success(response.data.data.message);
                setIsUploadModalOpen(false);
                setUploadProgress(0); // reset after modal close or after UI clears progress bar
            };
        } catch (err) {
            const errorMessage = err?.response?.data?.error || err?.response?.data?.message || "An unexpected error occurred.";
            toast.error(errorMessage);
            setUploadProgress(0);
            setIsUploadModalOpen(false);
        }
    };

    const handleStartDelete = (contact: TContact) => {
        setContactToDelete(contact);
        setIsDeleteDialogOpen(true);
    };

    const handleDeleteContact = async () => {
        try {
            const response = await axios.delete(`contact/${contactToDelete.id}`, {
                data: { deleted_by: auth_id },
                headers: Authorizations(token)
            });
            if (response.status === 200) {
                setIsDeleteDialogOpen(false);
                handleGetContact();
                toast.success(response.data.data.message);
            }
        } catch (err) {
            const errorMessage = err?.response?.data?.error || err?.response?.data?.message || "An unexpected error occurred.";
            toast.error(errorMessage);
        }
    };

    // Export contacts to CSV
    const handleExportContactsCSV = async () => {
        try {
            const response = await axios.get(`contact/export/${auth_id}`, {
                headers: Authorizations(token)
            });
            const headers = [ "name", "email", "phone", "company", "position", "website", "category", "address", "map_link", "notes"];

            const csvData = response.data.data.map(contact => {
                return [
                    contact.name || "",
                    contact.email || "",
                    contact.phone || "",
                    contact.company || "",
                    contact.position || "",
                    contact.website || "",
                    contact.contact_category?.name || "",
                    contact.address || "",
                    contact.map_link || "",
                    contact.notes || ""
                ];
            });
            const csvContent = [headers, ...csvData].map(row => row.map(field => `"${field}"`).join(",")).join("\n");
            const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
            const link = document.createElement("a");
            const url = URL.createObjectURL(blob);
            link.setAttribute("href", url);
            link.setAttribute("download", `contacts_${new Date().toISOString().split('T')[0]}.csv`);
            link.style.visibility = "hidden";
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);

            toast.success("Contacts exported as CSV successfully!");
        } catch (err) {
            const errorMessage = err?.response?.data?.error || err?.response?.data?.message || "An unexpected error occurred.";
            toast.error(errorMessage);
        }
    };
    
    // start shared contacts
    const handleStartShare = (contact: TContact) => {
        setContactToShare(contact);
        setShareDialogOpen(true);
                
        if (contact.is_shared && contact.contact_sharing?.length > 0) {
            const emailList = contact.contact_sharing.map((share) => share.shared_with_user?.email).filter(Boolean).join(", ");
            setShareEmails(emailList);
            const sharedEntry = contact.contact_sharing.find(share => share.contact_id === contact.id);

            if (sharedEntry?.permissions === 'full' || sharedEntry?.permissions === 'read') {
                setPermission(sharedEntry.permissions); 
            } else {
                setPermission('read');
            }
        } else {
            setShareEmails("");
            setPermission('read');
        }
    };
    // Handle actual share logic (send email addresses to backend)
    const handleShareContact = async () => {
        try {
            if (!contactToShare) return;
            const emailList = selectedTeams.map(team => team.email.trim()).filter(email => email);

            const payload = {
                client_id: client_id,
                domain: domain,
                user_id: auth_id,
                contact_id: contactToShare.id,
                emails: emailList,
                permissions: permission,
            };
            // Decide API endpoint based on whether it's an update
            const isUpdate = contactToShare.contact_sharing.length > 0;
            const url = isUpdate ? 'contact/share/update' : 'contact/share';
            const method = isUpdate ? axios.put : axios.post;

            const response = await method(url, payload, {
                headers: Authorizations(token)
            });

            if (response.status === 200) {
                toast.success(response.data.data.message);
                setShareDialogOpen(false);
                setContactToShare(null);
                setShareEmails("");
            }
            setCommitEmail(selectedTeams.map(team => team.id)); 
            socketService.socket.emit('contactShared', {
                emails: emailList,
                message: response.data.data.message,
                sharedByUserId: auth_id,
            });

        } catch (err) {
            const errorMessage = err?.response?.data?.error || err?.response?.data?.message || "An unexpected error occurred.";
            toast.error(errorMessage);
        }
    };

    //DOWNLOAD IMAGE OR FILE
    const handleDownload = async (url: string, filename: string) => {
        try {
            const response = await fetch(url, { mode: 'cors' });
            if (!response.ok) throw new Error('Network response was not ok');
            const blob = await response.blob();

            const blobUrl = window.URL.createObjectURL(blob);
            const link = document.createElement('a');
            link.href = blobUrl;
            link.setAttribute('download', filename);

            document.body.appendChild(link);
            link.click();
            link.remove();
            window.URL.revokeObjectURL(blobUrl);
        } catch (err) {
            toast.error('Downloaded file is empty.')
            console.error('Download failed:', err);
        }
    };

    const handleArchiveContact = async (id: number) => {
        try {
            const response = await axios.put(`contact/archive/${id}`, {}, {
                headers: Authorizations(token)
            });
            if (response.status === 200) {
                handleGetContact();
                toast.success(response.data.data.message);
            }
        } catch (err) {
            const errorMessage = err?.response?.data?.error || err?.response?.data?.message || "An unexpected error occurred.";
            toast.error(errorMessage);
        }
    };

    const handleGetTeam = async () => {
        try {
            const payload = { domain: domain };
            const response = await axios.get(`contact/team/${auth_id}`, {
                params: payload,
                headers: Authorizations(token)
            });
            if (response.status === 200) {
                setDataTeams(response.data.data);
            }
        } catch (err) {
            const errorMessage = err?.response?.data?.error || err?.response?.data?.message || "An unexpected error occurred.";
            toast.error(errorMessage);
        }
    };

    const handleTeamToggle = (id: number, domain: string, email: string) => {
        setSelectedTeams(prev => {
            const exists = prev.find(c => c.id === id);
            if (exists) {
                return prev.filter(c => c.id !== id);
            }
            return [...prev, { id, domain, email }];
        });
    };

    const isUserShared = (userId: number) => {
        return selectedTeams.some((c) => c.id === userId);
    };

    useEffect(() => {
        handleGetClientPermission();
        handleGetCategories();
        if (auth_id && token) {
            handleGetContact(currentPage);
        }
        
        if (commitEmail) { 
            socketService.register(commitEmail.map(String));
        }
        handleGetTeam();
    },[currentPage, contactsPerPage, commitEmail])

    useEffect(() => {
        if (contactToShare?.contact_sharing) {
            const preSelected = contactToShare.contact_sharing
            .map((share) => {
                const user = dataTeams.find((u) => u.id === share.shared_with_user_id);
                if (!user) return null;
                return {
                    id: user.id,
                    email: user.email,
                    domain: user.domain || "", 
                };
            })
            .filter(Boolean) as { id: number; domain: string; email: string }[];
            setSelectedTeams(preSelected);
        }
    }, [contactToShare, dataTeams]);


    return {
        handleAddCategory,
        dataCategories,
        handleUpdateCategory,
        setIsDialogOpen,
        isDialogOpen,
        categoryToEdit,
        setCategoryToEdit,
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
        setContactsPerPage,
        handleUpdateContact,
        contactToEdit,
        setContactToEdit,
        handleFileChange,
        selectedNewFiles,
        setSelectedNewFiles,
        isEditDialogOpen,
        setIsEditDialogOpen,
        handleDeleteContact,
        handleStartDelete,
        isDeleteDialogOpen,
        setIsDeleteDialogOpen,
        contactToDelete,
        setContactToDelete,
        selectedFiles,
        setSelectedFiles,
        handleImport,
        csvData,
        setCsvData,
        isOpen,
        setIsOpen,
        handleGetContact,
        step,
        setStep,
        handleExportContactsCSV,
        handleStartShare,
        handleShareContact,
        shareDialogOpen,
        setShareDialogOpen,
        shareEmails,
        setShareEmails,
        permission,
        setPermission,
        auth_id,
        role,
        contactToShare,
        setContactToShare,
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
        
    }
}