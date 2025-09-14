import { useState, useEffect, useMemo, useRef } from "react";
import axios from "axios";
import { Authorizations } from "@/utils/Authorization";
import { ProvideToken, AuthId, User } from "@/tokens/token";
import { toast } from "@/components/ui/sonner";
import { TProductCategories, TProduct, TProductThumbnail } from "@/types";
import { Currency } from '../tokens/currency';
import { useToast } from "@/hooks/use-toast";
import { showSuccess, showError } from "@/services/notification";
import { useForm } from "react-hook-form";

interface FileItem {
    id: string;
    name: string;
    type: string;
    size: number;
    file: File;
}

type FormValues = {
  stageId: string;
  category_id: number;  // string instead of number
};

export function useProduct() {

    const token = ProvideToken();
    const auth_id = AuthId();
    const { role, domain, client_id } = User();
    const { currency, rate } = Currency();

    const [isDialogOpen, setIsDialogOpen] = useState(false);
    const [isEditing, setIsEditing] = useState(false);
    const [editingId, setEditingId] = useState("");
    const [photoUrlInput, setPhotoUrlInput] = useState("");
    const [categoryDialogOpen, setCategoryDialogOpen] = useState(false);
    const [editingCategoryId, setEditingCategoryId] = useState<string | null>(null);
    const [deleteCategoryId, setDeleteCategoryId] = useState<string | null>(null);
    const [dataCategories, setDataCategories] = useState<TProductCategories[]>([]);
    const [newCategory, setNewCategory] = useState<Omit<TProductCategories, "id" | "user_id">>({ name: "", description: "" });
    const [viewDialogOpen, setViewDialogOpen] = useState(false);
    const [selectedFile, setSelectedFile] = useState<File[]>([]);
    const [selectedNewFiles, setSelectedNewFiles] = useState<FileItem[]>([]);
    const [dataProduct, setDataProduct] = useState<TProduct[]>([]);
    const [loading, setLoading] = useState<boolean>(false);
    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 10;
    const [productPerPage, setProductPerpage] = useState<number>(10)
    const [countPagination, setCountPagination] = useState<number>(0);
    const [viewingProduct, setViewingProduct] = useState<TProduct | null>(null);
    const [existingAttachments, setExistingAttachments] = useState<{ id: number; file_name: string, file_url: string }[]>([]);
    const [existingThumbnails, setExistingThumbnails] = useState<TProductThumbnail[]>([]);
    const [filterByCategory, setFilterByCategory] = useState<string>("all");
    const [searchTerm, setSearchTerm] = useState<string>('');
    const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
    const [productToDelete, setProductToDelete] = useState<TProduct | null>(null);
    const [uploadProgress, setUploadProgress] = useState(0);
    const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);
    const [selectedThumbnailFiles, setSelectedThumbnailFiles] = useState<File[]>([]);
    const [thumbnails, setThumbnails] = useState<string[]>([]);
    const [isDragging, setIsDragging] = useState(false);
    const [isUploading, setIsUploading] = useState(false);
    const fileInputRef = useRef(null);

    const [newProduct, setNewProduct] = useState<TProduct>({
        name: '',
        type: '',
        category_id: null,
        description: '',
        link: '',
        price: 0,
        thumbnail: ''
    });

    const form = useForm<FormValues>({
        defaultValues: {
            category_id: null,
        },
    });

    const handleAddCategory = () => {
        setNewCategory({ name: "", description: "" });
        setEditingCategoryId(null);
        setCategoryDialogOpen(true);
    };

    const handleSubmitCategory = async (category: { id?: string; name: string; description?: string }) => {
        try {
            const isUpdate = !!category.id;
            const endpoint = isUpdate ? `product/category/${category.id}` : `product/category`;
            const method = isUpdate ? 'put' : 'post';
            const payload = {
                domain: domain,
                client_id: client_id,
                user_id: auth_id,
                name: category.name,
                description: category.description
            }

            const response = await axios[method](endpoint, payload, {
                headers: Authorizations(token)
            });
            
            if (response.status === 200) {
                setCategoryDialogOpen(false);
                toast.success(response.data?.data?.message || `${isUpdate ? 'Updated' : 'Created'} category successfully`);
                setNewCategory({ name: "", description: "" });
                setViewDialogOpen(false);
                handleGetCategory();
            }

        } catch (err) {
            const errorMessage = err?.response?.data?.error || err?.response?.data?.message || "An unexpected error occurred.";
            toast.error(errorMessage);
            return null;
        }
    };

    const handleSaveCategory = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            const saved = await handleSubmitCategory({
                id: editingCategoryId ?? undefined,
                name: newCategory.name,
                description: newCategory.description
            });

            if (saved) {
                if (editingCategoryId) {
                    setDataCategories(prev =>
                        prev.map(cat => cat.id.toString() === editingCategoryId ? { ...cat, ...saved } : cat)
                    );
                } else {
                    setDataCategories(prev => [...prev, saved]);
                }
                setNewCategory({ name: "", description: "" });
                setEditingCategoryId(null);
                setCategoryDialogOpen(false);
            }

        } catch (err) {
            throw (err);
        }

    };

    const handleGetCategory = async () => {
        try {
            const payload = { domain: domain };
            const response = await axios.get(`product/category/${auth_id}`, {
                params: payload,
                headers: Authorizations(token)
            });
            if (response.status === 200) {
                setDataCategories(response.data.data)
            }
        } catch (err) {
            const errorMessage = err?.response?.data?.error || err?.response?.data?.message || "An unexpected error occurred.";
            toast.error(errorMessage);
        }
    };

    const handleEditCategory = async (category: TProductCategories) => {
        setNewCategory({ name: category.name, description: category.description || "" });
        setEditingCategoryId(category.id.toString());
        setCategoryDialogOpen(true); 
    };

    const handleDeleteCategory = async (categoryId: string) => {
        try {
            const response = await axios.delete(`product/category/${categoryId}`,{
                headers: Authorizations(token)
            });
            if (response.status === 200) {
                toast.success(response.data.data.message);
                handleGetCategory();
            };
        } catch (err) {
            const errorMessage = err?.response?.data?.error || err?.response?.data?.message || "An unexpected error occurred.";
            toast.error(errorMessage);
        }
    };

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const files = e.target.files;
        if (!files || files.length === 0) return;

        const validFiles: File[] = [];

        for (let i = 0; i < files.length; i++) {
            const file = files[i];
            if (file.size > 100 * 1024 * 1024) {
                showError({
                    title: "File too large",
                    description: `${file.name} exceeds the 100MB limit.`,
                });
                continue; // skip this file
            }
            validFiles.push(file);
        }
        if (validFiles.length === 0) return;

        const filesArray: FileItem[] = validFiles.map((file, index) => ({
            id: `new-${Date.now()}-${index}`,
            name: file.name,
            type: file.type,
            size: file.size,
            file,
        }));

        setSelectedNewFiles((prev) => [...prev, ...filesArray]);
    };

    const handleFormSubmit: React.FormEventHandler<HTMLFormElement> = async (e) => {
        e.preventDefault();

        const formData = new FormData(e.currentTarget);
        const inputPrice = parseFloat(formData.get('price') as string);

        let price_usd = 0;
        let price_khr = 0;

        if (currency === 'USD') {
            price_usd = inputPrice;
            price_khr = inputPrice * rate; // convert to KHR
        } else {
            price_khr = inputPrice;
            price_usd = inputPrice / rate; // convert to USD
        }

        const product: TProduct = {
            domain: domain,
            client_id: client_id,
            // category_id: parseInt(formData.get('category_id') as string),
            category_id: newProduct.category_id || null,
            user_id: auth_id,
            name: formData.get('name') as string || undefined,
            role: role,
            price_usd,
            price_khr,
            description: formData.get('description') as string || undefined,
            link: formData.get('link') as string || undefined,
            status: currency,
            external_link: photoUrlInput
        };

        const files = formData.getAll('attachments').filter(f => f instanceof File) as File[];
        await handleSubmit(product, files.length ? files : null);
    };

    const handlePhotoUrlChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setPhotoUrlInput(e.target.value);
    };

    const removePhoto = () => {
        setNewProduct(prev => ({ ...prev, photoUrl: undefined }));
        setPhotoUrlInput("");
    };

    const selectSamplePhoto = (url: string) => {
        setNewProduct(prev => ({ ...prev, photoUrl: url }));
        setPhotoUrlInput(url);
    };

    const handleTypeChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        setNewProduct(prev => ({
            ...prev,
            type: e.target.value as "product" | "service"
        }));
    };

    const handleSubmit = async (product: TProduct, files: File[] | null) => {
        try {
            setIsUploadModalOpen(true);
            setUploadProgress(0);
            
            const form = new FormData();
            // Add form fields
            Object.entries(product).forEach(([key, value]) => {
                if (value !== undefined && value !== null) {
                    form.append(key, value as string);
                }
            });

            // Handle thumbnail
            if (selectedThumbnailFiles.length > 0) {
                selectedThumbnailFiles.forEach((file) => {
                    form.append('thumbnails', file);
                });
            }

            if (selectedNewFiles && selectedNewFiles.length > 0) {
                selectedNewFiles.forEach((item) => {
                    form.append("attachments", item.file);
                });
            }

            // Decide API method and URL
            const isEdit = !!editingId;
            const url = isEdit ? `/product/${editingId}` : '/product';
            const method = isEdit ? 'put' : 'post';

            const response = await axios({ url, method, data: form,
                headers: {
                    ...Authorizations(token)
                },
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
                
                handleGetProduct();
                toast.success(response.data.data.message || (isEdit ? 'Product updated!' : 'Product created!'));
                setNewProduct({
                    name: '',
                    type: '',
                    category_id: null,
                    description: '',
                    link: '',
                    price: 0,
                    thumbnail: ''
                });
                setSelectedNewFiles([]);
                setThumbnails([]);
                setSelectedThumbnailFiles([]);
                setPhotoUrlInput('');
                setExistingAttachments([]);
                setIsDialogOpen(false);
                setIsEditing(false);
                setIsUploadModalOpen(false);
                setUploadProgress(0); // reset after modal close or after UI clears progress bar
            }
        } catch (err) {
            const errorMessage = err?.response?.data?.error || err?.response?.data?.message || "An unexpected error occurred.";
            toast.error(errorMessage);
            setUploadProgress(0);
            setIsUploadModalOpen(false);
        }
    };

    // handle get product
    const handleGetProduct = async (page = 1, search?: string) => {
        try {
            setLoading(true);
            const payload = {
                page: page,
                limit: productPerPage,
                domain: domain,
                search: search || searchTerm || ''
            };
            const response = await axios.get(`product/${auth_id}`, {
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
    }

    const handleView = (product: TProduct) => {
        setViewingProduct(product);
        setViewDialogOpen(true);
    };

    const handleEdit = (product: TProduct) => {
        setNewProduct({
            id: product.id,
            name: product.name || "",
            category_id: product.category_id ?? product.category?.id ?? null,
            price: currency === "KHR" ? product.price_khr : product.price_usd || 0,
            description: product.description || "",
            type: product.type || "",
            link: product.link || "",
        });

        setExistingThumbnails(product.thumbnails || []);
        setExistingAttachments(product.attachments || []);
        setEditingId(product.id?.toString() || "");
        setIsEditing(true);
        setIsDialogOpen(true);
    };

    const handleClear = () => {
        setNewProduct({
            name: '',
            type: '',
            category_id: null,
            description: '',
            link: '',
            price: 0,
            thumbnail: ''
        });
        setSelectedNewFiles([]);
        setThumbnails([]);
        setSelectedThumbnailFiles([]);
        setExistingAttachments([]);
        setExistingThumbnails([]);
        setIsDialogOpen(false);
        setEditingId('');
        setIsEditing(false);
    };

    const handleDelete = (product: TProduct) => {
        setProductToDelete(product);
        setIsDeleteDialogOpen(true);
    };

    const handleConfirmDeleteProduct = async () => {
        try {
            const payload = {
                deleted_by: auth_id
            };
            const response = await axios.delete(`product/${productToDelete.id}`, {
                data: payload, 
                headers: Authorizations(token)
            });
            if (response.status = 200) {
                toast.success(response.data.data.message);
                handleGetProduct();
            }
        } catch (err) {
            const errorMessage = err?.response?.data?.error || err?.response?.data?.message || "An unexpected error occurred.";
            toast.error(errorMessage);
        }
    };

    const filteredProducts = useMemo(() => {
        if (filterByCategory === 'all') return dataProduct;
        return dataProduct.filter(
            product => product.category?.name === filterByCategory
        );
    }, [dataProduct, filterByCategory]);

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

    // thumbnail 
    const handleFileSelect = (files: FileList | File[]) => {
        const newFiles = Array.from(files);
        setSelectedThumbnailFiles((prev) => [...prev, ...newFiles]);

        newFiles.forEach((file) => {
            if (file.type.startsWith("image/")) {
                const reader = new FileReader();
                reader.onload = (e) => {
                    setThumbnails((prev) => [...prev, e.target?.result as string]);
                };
                reader.readAsDataURL(file);
            } else {
                setThumbnails((prev) => [...prev, ""]);
            }
        });

        setIsUploading(true);
        setTimeout(() => setIsUploading(false), 2000);
    };

    const handleDrop = (e) => {
        e.preventDefault();
        setIsDragging(false);
        
        const files = e.dataTransfer.files;
        if (files.length > 0) {
            handleFileSelect(files[0]);
        }
    };

    const handleDragOver = (e) => {
        e.preventDefault();
        setIsDragging(true);
    };

    const handleDragLeave = (e) => {
        e.preventDefault();
        setIsDragging(false);
    };

    const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        if (file.size > 100 * 1024 * 1024) {
            showError({
                title: "File too large",
                description: `${file.name} exceeds the 100MB limit.`,
            });
            return;
        }

        handleFileSelect([file]);
    };

    const handleBrowseClick = (e: React.MouseEvent) => {
        e.preventDefault();
        fileInputRef.current?.click();  
    };

    const handleRemoveFile = (index: number) => {
        setSelectedThumbnailFiles((prev) => prev.filter((_, i) => i !== index));
        setThumbnails((prev) => prev.filter((_, i) => i !== index));
    };

    const formatFileSize = (bytes) => {
        if (bytes === 0) return '0 Bytes';
        const k = 1024;
        const sizes = ['Bytes', 'KB', 'MB', 'GB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
    };
    
    const handleRemoveThumbnail = async (id: number) => {
        try {
            const response = await axios.delete(`product/remove-thumbnail/${id}`, {
                headers: Authorizations(token)
            })
            if (response.status === 200) {
                handleGetProduct();
                toast.success(response.data.data.message);
            }
        } catch (err) {
            const errorMessage = err?.response?.data?.error || err?.response?.data?.message || "An unexpected error occurred.";
            toast.error(errorMessage);
        }
    }

    // end thumbnail  

    const handleRemoveAttachment = async (e, id: number) => {
        e.preventDefault();
        try {
            const response = await axios.delete(`product/delete-attachment/${id}`, {
                headers: Authorizations(token)
            });
            if (response.status === 200) {
                setExistingAttachments(prev => prev.filter(att => att.id !== id));
                toast.success(response.data.data.message);
                handleGetProduct();
            }

        } catch (err) {
            const errorMessage = err?.response?.data?.error || err?.response?.data?.message || "An unexpected error occurred.";
            toast.error(errorMessage);
            setIsUploadModalOpen(false);
        }
    };

    const handleArchive = async (product: TProduct) => {
        try {
            const response = await axios.put(`product/archive/${product.id}`, {}, {
                headers: Authorizations(token)
            });
            if (response.status === 200) {
                handleGetProduct();
                toast.success(response.data.data.message);
            }
        } catch (err) {
            const errorMessage = err?.response?.data?.error || err?.response?.data?.message || "An unexpected error occurred.";
            toast.error(errorMessage);
        }
    }

    useEffect(() => {
        handleGetCategory();
        if (auth_id && token) {
            handleGetProduct(currentPage);
        }
    },[currentPage])

    return {
        handleSubmitCategory,
        handleAddCategory,
        newCategory,
        setNewCategory,
        editingCategoryId,
        setEditingCategoryId,
        handleSaveCategory,
        viewDialogOpen,
        setViewDialogOpen,
        categoryDialogOpen,
        setCategoryDialogOpen,
        setDataCategories,
        dataCategories,
        handleEditCategory,
        handleDeleteCategory,
        deleteCategoryId,
        setDeleteCategoryId,
        selectedFile,
        setSelectedFile,
        handleFileChange,
        handleFormSubmit,
        newProduct,
        setNewProduct,
        currency,
        handlePhotoUrlChange,
        selectSamplePhoto,
        photoUrlInput,
        setPhotoUrlInput,
        removePhoto,
        handleTypeChange,
        isDialogOpen,
        setIsDialogOpen,
        loading,
        dataProduct,
        currentPage,
        countPagination,
        itemsPerPage,
        setCurrentPage,
        viewingProduct,
        handleView,
        handleEdit,
        existingAttachments,
        setExistingAttachments,
        handleClear,
        isEditing,
        setSearchTerm,
        searchTerm,
        handleSearchProduct,
        filteredProducts,
        filterByCategory,
        setFilterByCategory,
        handleDelete,
        isDeleteDialogOpen,
        setIsDeleteDialogOpen,
        productToDelete,
        setProductToDelete,
        handleConfirmDeleteProduct,
        handleDownload,
        domain,
        uploadProgress,
        isUploadModalOpen,
        setIsUploadModalOpen,
        handleFileSelect,
        handleDrop,
        handleDragOver,
        handleDragLeave,
        handleFileInputChange,
        handleBrowseClick,
        handleRemoveFile,
        formatFileSize,
        selectedThumbnailFiles,
        setSelectedThumbnailFiles,
        setThumbnails,
        thumbnails,
        isDragging,
        isUploading,
        fileInputRef,
        selectedNewFiles,
        setSelectedNewFiles,
        handleRemoveAttachment,
        handleArchive,
        existingThumbnails,
        setExistingThumbnails,
        handleRemoveThumbnail,
        form
        
    }
}