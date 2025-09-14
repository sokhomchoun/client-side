import { useState, useMemo, useRef } from "react";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { PlusCircle, Search,Trash2, Edit, Trash, Tag, Box, Package, Image, Filter,Share2Icon, Paperclip, Upload, ExternalLink, Eye, Settings, Grid, List, Archive } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter, DialogDescription, } from "@/components/ui/dialog";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Textarea } from "@/components/ui/textarea";
import { ProductTileView } from "@/components/ProductTileView";
import { useProduct } from "@/hooks/useProduct";
import { LoadingComponent } from "@/components/LoadingComponent";
import { Pagination } from "@/components/Pagination";
import { Link } from "react-router-dom";
import { useHasPermission } from "@/hooks/useHasPermission";
import { X, File  } from "lucide-react";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";

// Define sort options
type SortOption = "name-asc" | "name-desc" | "price-asc" | "price-desc" | "category-asc" | "category-desc" | "inventory-asc" | "inventory-desc";
const Products = () => { 

    const { 
        handleAddCategory,
        newCategory,
        setNewCategory,
        editingCategoryId,
        handleSaveCategory,
        viewDialogOpen,
        setViewDialogOpen,
        categoryDialogOpen,
        setCategoryDialogOpen,
        dataCategories,
        handleEditCategory,
        handleDeleteCategory,
        setDeleteCategoryId,
        deleteCategoryId,
        handleFileChange,
        handleFormSubmit,
        newProduct,
        setNewProduct,
        currency,
        handlePhotoUrlChange,
        photoUrlInput,
        removePhoto,
        isDialogOpen,
        setIsDialogOpen,
        loading,
        dataProduct,
        currentPage,
        countPagination,
        itemsPerPage,
        setCurrentPage,
        // viewingProduct,
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
        setThumbnails,
        thumbnails,
        setSelectedThumbnailFiles,
        selectedThumbnailFiles,
        viewingProduct,
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

    } = useProduct();

    const { hasPermission } = useHasPermission();

    // Add view mode state
    const [viewMode, setViewMode] = useState<"list" | "tiles">("list");
    const [sharedLink, setSharedLink] = useState<string | null>(null);
    const [selectedImage, setSelectedImage] = useState<string | null>(null);

    // Handle form input changes
    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const { name,  value } = e.target;
        setNewProduct(prev => ({
            ...prev,
            [name]: name === "price" || name === "cost" || name === "inventory" ? parseFloat(value) || 0 : value
        }));
    };


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
                        <progress value={uploadProgress} max={100} className="w-full custom-progress" />
                        <span>{uploadProgress}%</span>
                    </div>
                    <DialogFooter>
                        {uploadProgress === 100 && (
                            <Button onClick={() => setIsUploadModalOpen(false)}>Close</Button>
                        )}
                    </DialogFooter>
                </DialogContent>
            </Dialog>
            
            <div className="w-full">
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
                    <h1 className="text-2xl sm:text-3xl font-bold">Products & Services</h1>
                    <div className="flex flex-wrap gap-2">
                    {/* TRASH PRODUCT  */}
                    <Link to={`/${domain}/pipelines/archive-products`}>
                        <Button variant="default" size="sm" className="flex items-center mr-2 gap-2 bg-destructive text-white hover:bg-destructive/90">
                            <Archive className="h-4 w-4" />
                            Archive
                        </Button>
                    </Link>
                    {/* View Toggle */}
                    <div className="flex border rounded-md">
                        <Button variant={viewMode === "list" ? "default" : "ghost"} size="sm" onClick={() => setViewMode("list")} className="rounded-r-none">
                            <List className="h-4 w-4" />
                        </Button>
                        <Button variant={viewMode === "tiles" ? "default" : "ghost"} size="sm" onClick={() => setViewMode("tiles")} className="rounded-l-none">
                            <Grid className="h-4 w-4" />
                        </Button>
                    </div>
                    
                    <Dialog open={categoryDialogOpen} onOpenChange={setCategoryDialogOpen}>
                        <DialogTrigger asChild>
                            <Button variant="outline" onClick={handleAddCategory} className="flex items-center gap-2">
                                <Settings className="h-4 w-4" /> Manage Categories
                            </Button>
                        </DialogTrigger>
                    </Dialog>
                    
                    <Dialog open={isDialogOpen} onOpenChange={(open) => { setIsDialogOpen(open);  if (!open) handleClear(); }}>
                        <DialogTrigger asChild>
                            {hasPermission("products.create") && 
                                <Button className="flex items-center gap-2">
                                    <PlusCircle className="h-4 w-4" /> Add Product
                                </Button>
                            }
                        </DialogTrigger>
                        <DialogContent className="sm:max-w-[650px] max-h-[90vh] overflow-y-auto">
                        <DialogHeader onClick={handleClear}>
                            <DialogTitle>Add Product</DialogTitle>
                            <DialogDescription>
                                Add a new product.
                            </DialogDescription>
                        </DialogHeader>
                        <form onSubmit={handleFormSubmit}>
                            <div className="grid gap-6 py-4">
                            {/* Basic Information Section */}
                            <div className="space-y-4">
                                <div className="grid grid-cols-4 items-center gap-4">
                                    <Label htmlFor="name" className="text-right">Name *</Label>
                                    <Input id="name" name="name" value={newProduct.name} onChange={handleInputChange} className="col-span-3" required />
                                </div>
                                
                                <div className="grid grid-cols-4 items-center gap-4">
                                    <Label htmlFor="category" className="text-right"> Category *</Label>
                                    <FormField
                                        control={form.control}
                                        name="category_id"
                                        render={() => (
                                            <FormItem className="w-[200px]">
                                                <Select onValueChange={(value) =>
                                                    setNewProduct((prev) => ({
                                                        ...prev,
                                                        category_id: value && value !== "" ? parseInt(value, 10) : null,
                                                    }))
                                                    }
                                                    value={newProduct.category_id !== null ? newProduct.category_id.toString() : ""} 
                                                >
                                                    <FormControl>
                                                        <SelectTrigger>
                                                            <SelectValue placeholder="Select a category" />
                                                        </SelectTrigger>
                                                    </FormControl>
                                                    <SelectContent>
                                                        {dataCategories.map((category) => (
                                                            <SelectItem key={category.id} value={category.id.toString()}>
                                                            {category.name}
                                                            </SelectItem>
                                                        ))}
                                                    </SelectContent>
                                                </Select>
                                        <FormMessage />
                                        </FormItem>
                                        )}
                                    />
                                </div>

                                <div className="grid grid-cols-4 items-start gap-4">
                                    <Label className="text-right pt-2">
                                        Description
                                    </Label>
                                    <Textarea id="description" name="description" value={newProduct.description} onChange={handleInputChange} placeholder="Enter product/service description..." className="col-span-3 min-h-[100px]" />
                                </div>

                                <div className="grid grid-cols-4 items-center gap-4">
                                <Label htmlFor="link" className="text-right">
                                    Link
                                </Label>
                                <div className="col-span-3 flex gap-2">
                                    <Input id="link" name="link" value={newProduct.link} onChange={handleInputChange} placeholder="https://example.com/product" className="flex-1" />
                                    {newProduct.link && <Button type="button" variant="outline" size="icon" onClick={() => window.open(newProduct.link, '_blank')}>
                                        <ExternalLink className="h-4 w-4" />
                                    </Button>} 
                                </div>
                                </div>
                            </div>

                            {/* Pricing Section */}
                            <div className="space-y-4">
                                <h3 className="text-lg font-medium">Pricing</h3>
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="grid grid-cols-2 items-center gap-2">
                                        <Label htmlFor="price" className="text-right">{currency === "KHR" ? "Price KHR *" : "Price USD *"}</Label>
                                        <Input id="price" name="price" type="text" value={newProduct.price} onChange={handleInputChange} required />
                                    </div>
                                </div>
                            </div>
                            
                            {/* Photo Section */}
                            <div className="space-y-4">
                                <h3 className="text-lg font-medium">Photo</h3>
                                
                                <div className="grid grid-cols-4 items-start gap-4">
                                <Label className="text-right pt-2"></Label>
                                <div className="col-span-3 space-y-4">
                                    {/* File Upload */}
                                    <div className="space-y-2 md:col-span-2">
                                        <label className="text-sm font-medium">Attach Files</label>
                                        <Input type="file" name="attachments" multiple onChange={handleFileChange} className="cursor-pointer"/>
                                        <p className="text-xs text-muted-foreground">Max file size: 100MB</p>

                                        {/* Show existing files (read-only style) */}
                                        {existingAttachments.length > 0 && (
                                            <div className="mt-2 border rounded p-2 bg-muted">
                                                <p className="text-xs font-medium mb-1 text-muted-foreground">Attached Files:</p>
                                                <ul className="space-y-1">
                                                    {existingAttachments.map((att, index) => (
                                                        <li key={att.id || index} className="flex items-center justify-between text-sm text-muted-foreground bg-muted p-1 rounded">
                                                            <div className="flex items-center break-all">
                                                                <Paperclip className="h-3 w-3 mr-1" />
                                                                {att.file_name}
                                                            </div>
                                                            <div className="flex gap-1">
                                                                <Button
                                                                    variant="ghost"
                                                                    size="sm"
                                                                    onClick={(e) => {
                                                                        e.preventDefault();
                                                                        const downloadUrl = `${window.location.origin}/download-file?url=${encodeURIComponent(att.file_url)}&name=${encodeURIComponent(att.file_name)}`;
                                                                        window.open(downloadUrl, "_blank");
                                                                    }}
                                                                >
                                                                    <Share2Icon className="h-4 w-4 mr-1" />
                                                                </Button>
                                                                <Button variant="ghost" size="sm" onClick={(e) => handleRemoveAttachment(e, att.id)}>
                                                                    <Trash2 className="h-4 w-4" />
                                                                </Button>
                                                            </div>
                                                        </li>
                                                    ))}
                                                </ul>
                                            </div>
                                        )}
                                    </div>
                                    {selectedNewFiles.map((file) => (
                                        <div key={file.id} className="flex items-center justify-between p-2 rounded border bg-secondary/30">
                                            <div className="flex items-center gap-2 flex-1 min-w-0">
                                                <div className="flex-1 min-w-0">
                                                    <div className="text-sm font-medium truncate" title={file.name}>
                                                        {file.name}
                                                    </div>
                                                    <div className="text-xs text-muted-foreground flex gap-2">
                                                        <span>{formatFileSize(file.size)}</span>
                                                    </div>
                                                </div>
                                            </div>
                                            <div className="flex gap-1">
                                                <Button variant="ghost" size="icon" className="h-8 w-8 hover:text-destructive" 
                                                    onClick={() =>
                                                    setSelectedNewFiles((prev) => prev.filter((f) => f.id  !== file.id))
                                                }>
                                                    <Trash2 className="h-4 w-4" />
                                                </Button>
                                            </div>
                                        </div>
                                    ))}
                
                                {/* Thumbnail */}
                                <div className="max-w-md mx-auto">
                                    <div className="bg-white dark:bg-[#051438] text-white rounded-lg p-4">
                                        <div className="flex items-center justify-between mb-4">
                                            <label className="text-sm font-medium">Thumbnail</label>
                                        </div>
                                        <div className="border rounded-lg p-4 text-center transition-colors" onDrop={handleDrop} onDragOver={handleDragOver} onDragLeave={handleDragLeave}>
                                            <Upload className="mx-auto mb-4 text-gray-400" size={45} />
                                            <p className="text-muted-foreground mb-2 text-sm">
                                                Drag & Drop your files or{' '}
                                                <button onClick={handleBrowseClick} className="text-blue-400 hover:text-blue-300 underline">
                                                Browse
                                                </button>
                                            </p>

                                        {/* EXISTING thumbnails from DB */}
                                        {existingThumbnails.length > 0 && (
                                            <div className="mt-4 space-y-4">
                                                {existingThumbnails.map((thumb) => (
                                                <div key={thumb.id} className="flex items-center space-x-4 bg-white dark:bg-[#051438] p-2 rounded-lg">
                                                    <div className="w-24 h-16 flex-shrink-0">
                                                        <img src={thumb.thumbnail} alt={`Thumbnail ${thumb.id}`} className="w-24 h-16 object-cover rounded-lg"/>
                                                    </div>
                                                    <div className="flex-1 min-w-0">
                                                        <p className="text-sm font-medium truncate">{thumb.thumbnail.split("/").pop()}</p>
                                                        <p className="text-xs text-gray-400">
                                                        </p>
                                                    </div>
                                                    <button onClick={(e) => { 
                                                        e.preventDefault(); 
                                                        handleRemoveThumbnail(thumb.id);
                                                        setExistingThumbnails((prev) => prev.filter((t) => t.id !== thumb.id));
                                                    }} 
                                                        className="text-gray-400 hover:text-red-400 transition-colors">
                                                        <X size={16} />
                                                    </button>
                                                </div>
                                                ))}
                                            </div>
                                        )}

                                        {selectedThumbnailFiles.length > 0 && (
                                            <div className="mt-4 space-y-4">
                                                {selectedThumbnailFiles.map((file, index) => (
                                                <div key={index} className="flex items-center space-x-4 bg-white dark:bg-[#051438] p-2 rounded-lg">
                                                    <div className="w-24 h-16 flex-shrink-0">
                                                        {thumbnails[index] ? (
                                                            <img src={thumbnails[index]} alt={file.name} className="w-24 h-16 object-cover rounded-lg"
                                                            />
                                                        ) : (
                                                            <div className="w-24 h-16 rounded-lg border-1 border-gray-600 flex items-center justify-center">
                                                                <File className="text-gray-400" size={20} />
                                                            </div>
                                                        )}
                                                    </div>
                                                    <div className="flex-1 min-w-0">
                                                        <p className="text-sm font-medium truncate">{file.name}</p>
                                                        <p className="text-xs text-gray-400">
                                                            {file.size ? formatFileSize(file.size) : ""}
                                                        </p>
                                                    </div>

                                                    <button
                                                        onClick={(e) => {
                                                            e.preventDefault();
                                                            setSelectedThumbnailFiles((prev) =>  prev.filter((_, i) => i !== index)); 
                                                            setThumbnails((prev) => prev.filter((_, i) => i !== index));
                                                        }}
                                                        className="text-gray-400 hover:text-red-400 transition-colors"
                                                    >
                                                    <X size={16} />
                                                    </button>
                                                </div>
                                                ))}
                                            </div>
                                        )}

                                        </div>
                                        <p className="text-xs text-muted-foreground mt-2">Max file size: 100MB</p>

                                        {/* Hidden file input */}
                                        <input ref={fileInputRef} type="file" multiple onChange={handleFileInputChange} className="hidden" accept="image/*,*" />
                                    </div>
                                </div>

                                </div>
                                </div>
                            </div>
                            </div>
                            <DialogFooter className="pt-6">
                            <Button type="button" variant="outline" onClick={handleClear}>
                                Cancel
                            </Button>
                            <Button type="submit">{isEditing ? "Update" : "Add"}</Button>
                            </DialogFooter>
                        </form>
                        </DialogContent>
                    </Dialog>
                    </div>
                </div>

                <Card className="mb-6">
                    <CardHeader className="flex flex-col space-y-4 pb-2">
                    <div className="w-full flex flex-col lg:flex-row justify-between items-start lg:items-center space-y-4 lg:space-y-0 gap-4">
                        <div className="w-full lg:w-auto relative">
                            <div className="relative">
                                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                                <Input placeholder="Search products & services..." value={searchTerm} onChange={e => setSearchTerm(e.target.value)} className="w-full lg:w-[250px] pl-8"
                                onKeyDown={(e) => {
                                    if (e.key === 'Enter') {
                                        handleSearchProduct(searchTerm);
                                    }
                                }}
                                />
                            </div>
                        </div>
                    </div>
                    
                    {/* Filters Section */}
                    <div className="w-full flex flex-wrap items-center gap-2 sm:gap-4 pt-2 border-t">
                        <div className="flex items-center gap-2">
                            <Filter className="h-4 w-4 text-muted-foreground" />
                            <span className="text-sm font-medium">Filters:</span>
                        </div>
                        <Select value={filterByCategory} onValueChange={setFilterByCategory}>
                            <SelectTrigger className="w-[140px] h-8">
                                <SelectValue placeholder="Category" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="all">All Categories</SelectItem>
                                {dataCategories.map(category => <SelectItem key={category.id} value={category.name}>
                                    {category.name}
                                </SelectItem>)}
                            </SelectContent>
                        </Select>
                        
                        <div className="text-sm text-muted-foreground ml-auto hidden sm:block">
                            Showing {dataProduct.length} of {dataProduct.length} items
                        </div>
                    </div>
                    </CardHeader>
                    <CardContent className="p-0 overflow-auto">
                    {viewMode === "list" ? (
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead className="w-[280px]">
                                        <Button variant="ghost" className="h-auto p-0 font-semibold hover:bg-transparent">
                                            Name
                                        </Button>
                                    </TableHead>
                                    <TableHead>
                                        <Button variant="ghost" className="h-auto p-0 font-semibold hover:bg-transparent">
                                            Category
                                        </Button>
                                    </TableHead>
                                    <TableHead>
                                        <Button variant="ghost" className="h-auto p-0 font-semibold hover:bg-transparent">
                                            Price
                                        </Button>
                                    </TableHead>
                                    <TableHead>
                                        <Button variant="ghost" className="h-auto p-0 font-semibold hover:bg-transparent">
                                            Created By
                                        </Button>
                                    </TableHead>
                                    <TableHead className="text-right">Actions</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {filteredProducts.length > 0 ? filteredProducts.map(product => <TableRow key={product.id}>
                                    <TableCell className="font-medium">
                                        <div className="flex items-center gap-3">
                                            <Avatar className="w-9 h-9 rounded-md">
                                                {product.thumbnails && product.thumbnails.length > 0 ? (
                                                    <AvatarImage src={product.thumbnails[0].thumbnail} alt={product.name} className="object-cover" />
                                                ) : product.photoUrl ? (
                                                    <AvatarImage src={product.photoUrl} alt={product.name} className="object-cover"/>
                                                ) : (
                                                    <AvatarFallback className="rounded-md bg-secondary">
                                                        {product.type === "product" ? (
                                                            <Box className="h-4 w-4 text-muted-foreground" />
                                                        ) : (
                                                            <Tag className="h-4 w-4 text-muted-foreground" />
                                                        )}
                                                    </AvatarFallback>
                                                )}
                                            </Avatar>

                                            <div className="flex flex-col">
                                                <div className="flex items-center gap-2">
                                                    <span className="font-medium">{product.name}</span>
                                                    {product.link && (
                                                        <Button variant="ghost" size="icon" className="h-4 w-4 p-0" onClick={() => window.open(product.link, '_blank')}>
                                                            <ExternalLink className="h-3 w-3" />
                                                        </Button>
                                                    )}
                                                </div>
                                            </div>
                                        </div>
                                    </TableCell>
                                    <TableCell>{product.category?.name}</TableCell>
                                    <TableCell className="font-medium">
                                        {currency === "KHR"
                                            ? `${ product.price_khr.toLocaleString() } ៛`
                                            : `$ ${product.price_usd.toLocaleString()}`}
                                    </TableCell>
                                    <TableCell>{product.user.name}</TableCell>
                                    <TableCell className="text-right">
                                        <div className="flex justify-end">
                                           
                                            {hasPermission("products.view") && 
                                                <Button variant="ghost" size="icon" onClick={() => handleView(product)}>
                                                    <Eye className="h-4 w-4" />
                                                    <span className="sr-only">View</span>
                                                </Button>
                                            }
                                            {hasPermission("products.edit") && 
                                                <Button variant="ghost" size="icon" onClick={() => handleEdit(product)}>
                                                    <Edit className="h-4 w-4" />
                                                    <span className="sr-only">Edit</span>
                                                </Button>
                                            }
                                            <Button variant="ghost" size="icon" onClick={() => handleArchive(product)}>
                                                <Archive className="h-4 w-4" />
                                            </Button>
                                            {hasPermission("products.delete") && 
                                                <Button variant="ghost" size="icon" onClick={() => handleDelete(product)}>
                                                    <Trash className="h-4 w-4" />
                                                    <span className="sr-only">Delete</span>
                                                </Button>
                                            }
                                        </div>
                                    </TableCell>
                                    </TableRow>) : <TableRow>
                                </TableRow>}
                            </TableBody>
                        </Table>
                    ) : (
                        <div className="p-4">
                        <ProductTileView
                            products={filteredProducts}
                            loading={loading}
                            onView={handleView}
                            onEdit={handleEdit}
                            onDelete={handleDelete}
                            currency={currency}
                            hasPermission={hasPermission}
                            handleArchive={handleArchive}
                        />
                        </div>
                    )}
                    </CardContent>
                </Card>

                {/* View Product Dialog */}
                <Dialog open={viewDialogOpen} onOpenChange={setViewDialogOpen}>
                    <DialogContent className="sm:max-w-[70%] max-h-[90vh] bg-white dark:bg-[#051438]">
                        <DialogHeader className="border-b pb-4">
                            <div className="flex items-center justify-between">
                                <div>
                                    <DialogTitle className="text-xl font-semibold">
                                        {viewingProduct?.name}
                                    </DialogTitle>
                                    <DialogDescription className="mt-1 text-sm">
                                        Detailed view of the product. You can review, close, or edit it.
                                    </DialogDescription>
                                </div>
                            </div>
                        </DialogHeader>

                        {viewingProduct && (
                            <div className="py-6">
                                <div className="grid grid-cols-1 md:grid-cols-[65%_35%] gap-8">
                                <div className="space-y-4">
                                    <div className="relative overflow-hidden shadow-lg bg-white dark:bg-[#051438] border">
                                        <img
                                            src={selectedImage || viewingProduct.thumbnails?.[0]?.thumbnail}
                                            alt={viewingProduct.name}
                                            className="w-full object-cover transition-all duration-500 ease-in-out transform hover:scale-105"
                                            style={{ aspectRatio: "16/10" }}
                                        />
                                        <div className="absolute inset-0 bg-gradient-to-t from-black/10 to-transparent pointer-events-none"></div>
                                    </div>

                                    {/* Thumbnails */}
                                    {viewingProduct.thumbnails?.length > 0 && (
                                        <div className="flex gap-3 overflow-x-auto pb-2">
                                            {viewingProduct.thumbnails.map((thumb, idx) => (
                                            <button
                                                key={thumb.id || idx}
                                                onClick={() => setSelectedImage(thumb.thumbnail)}
                                                onMouseEnter={() => setSelectedImage(thumb.thumbnail)}
                                                className={`relative flex-shrink-0 w-24 h-20 overflow-hidden border-2 transition-all duration-200 hover:shadow-md
                                                ${
                                                    (selectedImage ||
                                                    viewingProduct.thumbnails[0].thumbnail) ===
                                                    thumb.thumbnail
                                                    ? "border-blue-[#061439]"
                                                    : "border-gray-200 hover:border-gray-300"
                                                }`}
                                            >
                                                <img src={thumb.thumbnail} alt={`${viewingProduct.name} view ${idx + 1}`} className="w-full h-full object-cover"/>
                                            </button>
                                            ))}
                                        </div>
                                    )}
                                    {/* Description */}
                                    {viewingProduct.description && (
                                        <div>
                                            <Label className="text-sm font-medium tracking-wide">
                                                Description
                                            </Label>
                                            <div className="rounded-lg p-4 bg-gray-50 dark:bg-[#0b1a38] mt-1">
                                                <p className="leading-relaxed">{viewingProduct.description}</p>
                                            </div>
                                        </div>
                                    )}
                                </div>
                                <div className="pr-[30px] max-md:pr-0">
                                    <div className="space-y-6 border h-min p-5">
                                        <div>
                                            <Label className="text-sm font-medium tracking-wide uppercase">Category</Label>
                                            <div className="px-3 py-1 mt-1 ml-2 rounded-full text-sm font-medium inline-block bg-[#B4B8C4] text-[#1F2C4D]">
                                                {viewingProduct.category?.name}
                                            </div>
                                        </div>
                                        <div>
                                            <Label className="text-sm font-medium uppercase tracking-wide">Price</Label>
                                            <p className="text-2xl font-bold mt-1">
                                                {currency === "KHR"
                                                ? `${viewingProduct.price_khr.toLocaleString()} ៛`
                                                : `$${viewingProduct.price_usd.toLocaleString(undefined, {
                                                    minimumFractionDigits: 2,
                                                    })}`}
                                            </p>
                                        </div>
                                        {/* External Link */}
                                        {viewingProduct.link && (
                                            <div>
                                                <Label className="text-sm font-medium uppercase tracking-wide">
                                                    External Link
                                                </Label>
                                                <div className="flex items-center gap-3 p-3 mt-1 rounded-lg">
                                                    <p className="text-sm text-blue-600 underline font-medium flex-1 truncate">
                                                        {viewingProduct.link}
                                                    </p>
                                                    <Button variant="outline" size="sm" className="h-8 px-3" onClick={() => window.open(viewingProduct.link, "_blank")}>
                                                        <ExternalLink className="h-4 w-4 mr-1" />
                                                        Open
                                                    </Button>
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                    <div className="mt-8">
                                        {viewingProduct.attachments.map((att, index) => (
                                            <li key={att.id || index} className="flex items-center justify-between text-sm text-muted-foreground bg-muted p-1 rounded mt-[2px]">
                                                <div className="flex items-center break-all">
                                                    <Paperclip className="h-3 w-3 mr-1" />
                                                    {att.file_name}
                                                </div>
                                                <div className="flex gap-1">
                                                    <Button
                                                        variant="ghost"
                                                        size="sm"
                                                        onClick={(e) => {
                                                            e.preventDefault();
                                                            const downloadUrl = `${window.location.origin}/download-file?url=${encodeURIComponent(att.file_url)}&name=${encodeURIComponent(att.file_name)}`;
                                                            window.open(downloadUrl, "_blank");
                                                        }}
                                                    >
                                                        <Share2Icon className="h-4 w-4 mr-1" />
                                                    </Button>
                                                    {/* <Button variant="ghost" size="sm" onClick={(e) => handleRemoveAttachment(e, att.id)}>
                                                        <Trash2 className="h-4 w-4" />
                                                    </Button> */}
                                                </div>
                                            </li>
                                        ))}
                                    </div>
                                </div>
                                </div>
                            </div>
                        )}

                        <DialogFooter className="border-t pt-4 space-x-2">
                        <Button variant="outline" onClick={() => setViewDialogOpen(false)}>
                            Close
                        </Button>
                        {hasPermission("products.edit") && (
                            <Button
                                onClick={() => {
                                    if (viewingProduct) {
                                    handleEdit(viewingProduct);
                                    setViewDialogOpen(false);
                                    }
                                }}
                            >
                            Edit Product
                            </Button>
                        )}
                        </DialogFooter>
                    </DialogContent>
                </Dialog>





                {/* Category Management Dialog */}
                <Dialog open={categoryDialogOpen} onOpenChange={setCategoryDialogOpen}>
                    <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
                        <DialogHeader>
                            <DialogTitle>Manage Categories</DialogTitle>
                            <DialogDescription>
                                Add, edit, or delete product categories. Categories with assigned products cannot be deleted.
                            </DialogDescription>
                        </DialogHeader>
                    
                        <div className="space-y-6">
                            {/* Add/Edit Category Form */}
                            <form onSubmit={handleSaveCategory} className="space-y-4">
                                <div className="grid grid-cols-4 items-center gap-4">
                                    <Label htmlFor="categoryName" className="text-right">Name* </Label>
                                        <Input id="categoryName" 
                                            value={newCategory.name} 
                                            onChange={e => setNewCategory(prev => ({...prev, name: e.target.value }))} 
                                            className="col-span-3" 
                                            placeholder="Enter category name" required 
                                        />
                                </div>
                                <div className="grid grid-cols-4 items-start gap-4">
                                    <Label htmlFor="categoryDescription" className="text-right pt-2">Description</Label>
                                    <Textarea 
                                        id="categoryDescription" 
                                        value={newCategory.description} 
                                        onChange={e => setNewCategory(prev => ({...prev, description: e.target.value}))} 
                                        className="col-span-3" 
                                        placeholder="Enter category description" 
                                        rows={3} 
                                    />
                                </div>
                                <div className="flex justify-end gap-2">
                                    <Button type="button" variant="outline" onClick={() => { setNewCategory({ name: "", description: "" });}}>Clear</Button>
                                    <Button type="submit">
                                        {editingCategoryId ? "Update Category" : "Add Category"}
                                    </Button>
                                </div>
                            </form>

                            {/* Categories List */}
                            <div className="space-y-4">
                                <h3 className="text-lg font-medium">Existing Categories</h3>
                                <div className="border rounded-md">
                                    <Table>
                                        <TableHeader>
                                            <TableRow>
                                                <TableHead>Name</TableHead>
                                                <TableHead>Description</TableHead>
                                                <TableHead>Products</TableHead>
                                                <TableHead className="text-right">Actions</TableHead>
                                            </TableRow>
                                        </TableHeader>
                                        <TableBody>
                                            {dataCategories.map(category => {
                                                const productCount = dataProduct.filter(p => p.category === category.name).length;
                                                return <TableRow key={category.id}>
                                                    <TableCell className="font-medium">{category.name}</TableCell>
                                                    <TableCell className="text-sm text-muted-foreground">
                                                        {category.description || "No description"}
                                                    </TableCell>
                                                    <TableCell>{category._count.product}</TableCell>
                                                    <TableCell className="text-right">
                                                        <div className="flex justify-end gap-2">
                                                            <Button variant="ghost" size="icon" onClick={() => handleEditCategory(category)}>
                                                                <Edit className="h-4 w-4" />
                                                            </Button>
                                                            <Button variant="ghost" size="icon" onClick={() => setDeleteCategoryId(category.id.toString())} disabled={productCount > 0}>
                                                                <Trash className="h-4 w-4" />
                                                            </Button>
                                                        </div>
                                                    </TableCell>
                                                </TableRow>;
                                            })}
                                        </TableBody>
                                    </Table>
                                </div>
                            </div>
                        </div>
                    
                        <DialogFooter>
                            <Button variant="outline" onClick={() => setCategoryDialogOpen(false)}>
                                Close
                            </Button>
                        </DialogFooter>
                    </DialogContent>
                </Dialog>

                 <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
                    <AlertDialogContent>
                        <AlertDialogHeader>
                            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                            <AlertDialogDescription>
                            This will permanently delete the product {productToDelete?.name}. This action cannot be undone.
                            </AlertDialogDescription>
                        </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel onClick={() => setProductToDelete(null)}>Cancel</AlertDialogCancel>
                        <AlertDialogAction className="bg-destructive text-destructive-foreground hover:bg-destructive/90" onClick={handleConfirmDeleteProduct}>
                            Delete
                        </AlertDialogAction>
                    </AlertDialogFooter>
                    </AlertDialogContent>
                </AlertDialog>

                {/* Delete Category Confirmation Dialog */}
                <AlertDialog open={!!deleteCategoryId} onOpenChange={open => !open && setDeleteCategoryId(null)}>
                        <AlertDialogContent>
                            <AlertDialogHeader>
                                <AlertDialogTitle>Delete Category</AlertDialogTitle>
                                <AlertDialogDescription>
                                    Are you sure you want to delete this category? This action cannot be undone.
                                    Categories with assigned products cannot be deleted.
                                </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                                <AlertDialogCancel onClick={() => setDeleteCategoryId(null)}>
                                    Cancel
                                </AlertDialogCancel>
                                <AlertDialogAction className="bg-destructive text-destructive-foreground hover:bg-destructive/90" onClick={() => deleteCategoryId && handleDeleteCategory(deleteCategoryId)}>
                                    Delete
                                </AlertDialogAction>
                            </AlertDialogFooter>
                        </AlertDialogContent>
                </AlertDialog>
            </div>
            {/* Pagination  */}
            <Pagination
                currentPage={currentPage}
                totalCount={countPagination}
                itemsPerPage={itemsPerPage}
                onPageChange={(page) => setCurrentPage(page)}
            />
            
        </main>
      
    );
};

export default Products;

