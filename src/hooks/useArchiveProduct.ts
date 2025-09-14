import { useState, useEffect, useMemo } from "react";
import axios from "axios";
import { Authorizations } from "@/utils/Authorization";
import { ProvideToken, AuthId, User } from "@/tokens/token";
import { toast } from "@/components/ui/sonner";
import { TProductCategories, TProduct } from "@/types";
import { Currency } from '../tokens/currency';

export function useArchiveProduct() {

    const token = ProvideToken();
    const auth_id = AuthId();
    const { domain } = User();
    const { currency } = Currency();

    const [isDialogOpen, setIsDialogOpen] = useState(false);
    const [photoUrlInput, setPhotoUrlInput] = useState("");
    const [categoryDialogOpen, setCategoryDialogOpen] = useState(false);
    const [editingCategoryId, setEditingCategoryId] = useState<string | null>(null);
    const [deleteCategoryId, setDeleteCategoryId] = useState<string | null>(null);
    const [dataCategories, setDataCategories] = useState<TProductCategories[]>([]);
    const [newCategory, setNewCategory] = useState<Omit<TProductCategories, "id" | "user_id">>({ name: "", description: "" });
    const [viewDialogOpen, setViewDialogOpen] = useState(false);
    const [selectedFile, setSelectedFile] = useState<File[]>([]);
    const [dataProduct, setDataProduct] = useState<TProduct[]>([]);
    const [loading, setLoading] = useState<boolean>(false);
    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 10;
    const [productPerPage, setProductPerpage] = useState<number>(10)
    const [countPagination, setCountPagination] = useState<number>(0);
    const [viewingProduct, setViewingProduct] = useState<TProduct | null>(null);
    const [existingAttachments, setExistingAttachments] = useState<{ id: number; file_name: string }[]>([]);
    const [filterByCategory, setFilterByCategory] = useState<string>("all");
    const [searchTerm, setSearchTerm] = useState<string>('');
    const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
    const [productToDelete, setProductToDelete] = useState<TProduct | null>(null);

    const [newProduct, setNewProduct] = useState<TProduct>({
        name: '',
        type: '',
        category_id: null,
        description: '',
        link: '',
        price: 0,
        external_link: '',
    });

    // handle get product
    const handleGetProduct = async (page = 1, search?: string) => {
        try {
            setLoading(true);
            const payload = {
                page: page,
                limit: productPerPage,
                domain: domain,
                search: search || searchTerm || '',

            };
            const response = await axios.get(`product/view-archive/${auth_id}`, {
                params: payload,
                headers: Authorizations(token)
            });
            if (response.status === 200) {
                setDataProduct(response.data.data.product);
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

    const handleSearchProduct = async (value: string) => {
         try {
            await handleGetProduct(currentPage, value);
        } catch (err) {
            console.error('Search failed:', err);
        }
    };
    
    const filteredProducts = useMemo(() => {
        if (filterByCategory === 'all') return dataProduct;
        return dataProduct.filter(
            product => product.category?.name === filterByCategory
        );
    }, [dataProduct, filterByCategory]);


    const handleRestoreArchive = async (id: number) => {
        try {
            const payload = id;
            const response  = await axios.put(`product/restore-archive/${payload}`, {}, {
                headers: Authorizations(token)
            });
            if (response.status === 200) {
                toast.success(response.data.data.message)
                handleGetProduct();
            }
        } catch (err) {
            const errorMessage = err?.response?.data?.error || err?.response?.data?.message || "An unexpected error occurred.";
            toast.error(errorMessage);
        }
    };

    const handleDeletedRestoreProduct = async (product: TProduct) => {
        setProductToDelete(product);
        setIsDeleteDialogOpen(true);
    };

    const handleConfirmDelete = async () => {
        try {
            const payload = productToDelete.id;
            const response = await axios.delete(`product/${payload}`, {
                headers: Authorizations(token) 
            });

            if (response.status === 200) {
                toast.success(response.data.data.message)
                handleGetProduct();
            };

        } catch (err) {
            const errorMessage = err?.response?.data?.error || err?.response?.data?.message || "An unexpected error occurred.";
            toast.error(errorMessage);
        }
    };

    useEffect(() => {
        if (auth_id && token) {
            handleGetProduct(currentPage);
        }
    },[currentPage])

    return {
        newCategory,
        setNewCategory,
        editingCategoryId,
        setEditingCategoryId,
        viewDialogOpen,
        setViewDialogOpen,
        categoryDialogOpen,
        setCategoryDialogOpen,
        setDataCategories,
        dataCategories,
        deleteCategoryId,
        setDeleteCategoryId,
        selectedFile,
        setSelectedFile,
        newProduct,
        setNewProduct,
        currency,
        photoUrlInput,
        setPhotoUrlInput,
        isDialogOpen,
        setIsDialogOpen,
        loading,
        dataProduct,
        currentPage,
        countPagination,
        itemsPerPage,
        setCurrentPage,
        viewingProduct,
        existingAttachments,
        setExistingAttachments,
        setSearchTerm,
        searchTerm,
        handleSearchProduct,
        filteredProducts,
        filterByCategory,
        setFilterByCategory,
        isDeleteDialogOpen,
        setIsDeleteDialogOpen,
        productToDelete,
        setProductToDelete,
        handleRestoreArchive,
        handleDeletedRestoreProduct,
        handleConfirmDelete
        
    }
}