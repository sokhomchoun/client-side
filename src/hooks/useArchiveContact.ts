import { useEffect, useState, useMemo } from "react";
import axios from "axios";
import { Authorizations } from "@/utils/Authorization";
import { ProvideToken, AuthId, User } from "@/tokens/token";
import { toast } from "@/components/ui/sonner";
import { TContact } from "@/types";
import { Currency } from '../tokens/currency';

export function useArchiveContact () {

    const token = ProvideToken();
    const auth_id = AuthId();
    const { domain } = User();
    const { currency } = Currency();

    const [dataContact, setDataContact] = useState<TContact[]>([]);
    const [loading, setLoading] = useState<boolean>(false);
    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 10;
    const [contactPerPage, setContactPerpage] = useState<number>(10)
    const [countPagination, setCountPagination] = useState<number>(0);
    const [existingAttachments, setExistingAttachments] = useState<{ id: number; file_name: string }[]>([]);
    const [filterByCategory, setFilterByCategory] = useState<string>("all");
    const [searchTerm, setSearchTerm] = useState<string>('');
    const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
    const [contactToDelete, setContactToDelete] = useState<TContact | null>(null);

    const handleGetArchiveContact = async (page = 1, search?: string) => {
        try {
            setLoading(true);
            const payload = {
                page: page,
                limit: contactPerPage,
                domain: domain,
                search: search || searchTerm || '',

            };
            const response = await axios.get(`contact/archive/${auth_id}`, {
                params: payload,
                headers: Authorizations(token)
            });
            if (response.status === 200) {
                setDataContact(response.data.data.contact);
                setCountPagination(response.data.data.paginations.total);
                setCurrentPage(response.data.data.paginations.currentPage);
                setLoading(false);
            };
            
        } catch (err) {
            const errorMessage = err?.response?.data?.error || err?.response?.data?.message || "An unexpected error occurred.";
            toast.error(errorMessage);
            setLoading(false);
        }
    };

    const handleSearchContact = async (value: string) => {
        try {
            await handleGetArchiveContact(currentPage, value);
        } catch (err) {
            console.error('Search failed:', err);
        }
    };

    const filteredContacts = useMemo(() => {
        if (filterByCategory === 'all') return dataContact;
        return dataContact.filter(
            contact => contact?.name === filterByCategory
        );
    }, [dataContact, filterByCategory]);

    const handleRestoreArchive = async (id: number) => {
        try {
            const response = await axios.put(`contact/archive-restore/${id}`, {}, {
                headers: Authorizations(token)
            });
            if (response.status === 200) {
                handleGetArchiveContact();
                toast.success(response.data.data.message);
            }
            
        } catch (err) {
            const errorMessage = err?.response?.data?.error || err?.response?.data?.message || "An unexpected error occurred.";
            toast.error(errorMessage);
        }
    };

    const handleDeletedRestoreContact  = async (contact: TContact) => {
        setContactToDelete(contact);
        setIsDeleteDialogOpen(true);
    };

    const handleConfirmDelete = async () => {
        try {
            const response = await axios.delete(`contact/${contactToDelete.id}`, {
                data: { deleted_by: auth_id },
                headers: Authorizations(token)
            });
            if (response.status === 200) {
                setIsDeleteDialogOpen(false);
                handleGetArchiveContact();
                toast.success(response.data.data.message);
            }
        } catch (err) {
            const errorMessage = err?.response?.data?.error || err?.response?.data?.message || "An unexpected error occurred.";
            toast.error(errorMessage);
        }
    };

    useEffect(() => {
        if (auth_id && token) {
            handleGetArchiveContact(currentPage);
        }
    },[currentPage])

    return {
        dataContact,
        currentPage,
        countPagination,
        itemsPerPage,
        setCurrentPage,
        existingAttachments,
        setExistingAttachments,
        setSearchTerm,
        searchTerm,
        filteredContacts,
        handleSearchContact,
        auth_id,
        handleRestoreArchive,
        setIsDeleteDialogOpen,
        contactPerPage,
        isDeleteDialogOpen,
        handleConfirmDelete,
        handleDeletedRestoreContact,
        contactToDelete,
        setContactToDelete

    }
}