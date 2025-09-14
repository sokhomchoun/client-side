import { useState, useMemo } from "react";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { PlusCircle, Search,Trash2, Edit, Trash,RotateCcw, Tag, Box, Package, Image, Filter, ArrowUpDown, ArrowUp, ArrowDown, Paperclip, Upload, ExternalLink, Eye, Settings, Grid, List, ArchiveRestore } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter, DialogDescription } from "@/components/ui/dialog";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useArchiveProduct } from "@/hooks/useArchiveProduct";
import { LoadingComponent } from "@/components/LoadingComponent";
import { Pagination } from "@/components/Pagination";
import { useHasPermission } from "@/hooks/useHasPermission";

// Define sort options
type SortOption = "name-asc" | "name-desc" | "price-asc" | "price-desc" | "category-asc" | "category-desc" | "inventory-asc" | "inventory-desc";
const ArchiveProduct = () => { 

    const { 
        categoryDialogOpen,
        setCategoryDialogOpen,
        setNewProduct,
        currency,
        loading,
        dataProduct,
        currentPage,
        countPagination,
        itemsPerPage,
        setCurrentPage,
        setSearchTerm,
        searchTerm,
        handleSearchProduct,
        filteredProducts,
        filterByCategory,
        isDeleteDialogOpen,
        setIsDeleteDialogOpen,
        productToDelete,
        setProductToDelete,
        handleRestoreArchive,
        handleDeletedRestoreProduct,
        handleConfirmDelete

    } = useArchiveProduct();

    const { hasPermission } = useHasPermission();

    // Add view mode state
    const [viewMode, setViewMode] = useState<"list" | "tiles">("list");

    return (
        <main>
            {/* <LoadingComponent isActive={loading} /> */}
            <div className="w-full">
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
                    <h1 className="text-2xl sm:text-3xl font-bold">Archive Products</h1>
                    <div className="flex flex-wrap gap-2">
                    </div>
                </div>

                <Card className="mb-6">
                    <CardHeader className="flex flex-col space-y-4 pb-2">
                    <div className="w-full flex flex-col lg:flex-row justify-between items-start lg:items-center space-y-4 lg:space-y-0 gap-4">
                        <div className="w-full lg:w-auto relative">
                            <div className="relative">
                                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                                <Input placeholder="Search products..." value={searchTerm} onChange={e => setSearchTerm(e.target.value)} className="w-full lg:w-[250px] pl-8"
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
                                    <TableCell className="text-right">
                                        <div className="flex justify-end">
                                            {hasPermission("products.restore") && 
                                                <Button onClick={() => handleRestoreArchive(product.id)} variant="outline" size="icon">
                                                    <ArchiveRestore className="h-4 w-4" />
                                                    <span className="sr-only">Archive</span>
                                                </Button>
                                            }
                                            {hasPermission("products.delete") && 
                                                <Button onClick={() => handleDeletedRestoreProduct(product)} variant="ghost" size="icon">
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
                        <div className="p-4"> </div>
                    )}
                    </CardContent>
                </Card>

                {/* Category Management Dialog */}
                <Dialog open={categoryDialogOpen} onOpenChange={setCategoryDialogOpen}>
                    <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
                        <DialogHeader>
                            <DialogTitle>Manage Categories</DialogTitle>
                            <DialogDescription>
                                Add, edit, or delete product categories. Categories with assigned products cannot be deleted.
                            </DialogDescription>
                        </DialogHeader>
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
                        <AlertDialogAction onClick={handleConfirmDelete} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
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

export default ArchiveProduct;
