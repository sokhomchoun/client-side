
import React from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Box, Tag, Edit, Trash, Eye, ExternalLink, Image, Archive } from "lucide-react";
import { TProduct } from "@/types";
import { LoadingComponent } from "./LoadingComponent";

interface ProductTileViewProps {
    products: TProduct[];
    loading: boolean;
    onView: (product: TProduct) => void;
    onEdit: (product: TProduct) => void;
    onDelete: (product: TProduct) => void;
    currency?: "USD" | "KHR";
    hasPermission: (permissionName: string) => boolean;
    handleArchive;
}

export const ProductTileView: React.FC<ProductTileViewProps> = ({
    products,
    loading,
    onView,
    onEdit,
    onDelete,
    currency,
    hasPermission,
    handleArchive
}) => {
    return (
        <main>
            <LoadingComponent isActive={loading} />
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                {products.length > 0 ? (
                    products.map((product) => (
                    <Card key={product.id} className="h-full flex flex-col">
                        <CardContent className="p-4 flex flex-col h-full">
                        {/* Product Image */}
                        <div className="flex justify-center mb-3">
                            <Avatar className="w-full h-36 rounded-md">
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
                        </div>
                       
                        {/* Product Info */}
                        <div className="flex-1 flex flex-col">
                            <div className="flex items-center gap-2 mb-2">
                                <h3 className="font-semibold text-sm truncate flex-1">{product.name}</h3>
                                {product.link && (
                                    <Button variant="ghost" size="icon" className="h-5 w-5 p-0" onClick={() => window.open(product.link, '_blank')}>
                                        <ExternalLink className="h-3 w-3" />
                                    </Button>
                                )}
                            </div>
                            <p className="text-xs text-muted-foreground mb-2">{product.category?.name}</p>

                            {product.description && (
                                <p className="text-xs text-muted-foreground line-clamp-2 mb-3 flex-1">
                                    {product.description}
                                </p>
                            )}
                            <span className="font-semibold text-sm">  
                                {currency === "KHR"
                                    ? `${ product.price_khr.toLocaleString() } ៛`
                                    : `$ ${product.price_usd.toLocaleString()}`
                                }
                            </span>
                            <div className="space-y-2 mt-auto">
                                {/* Actions */}
                                <div className="flex justify-center gap-1">
                                    {hasPermission("products.view") && 
                                        <Button variant="ghost" size="icon"  className="h-7 w-7" onClick={() => onView(product)}>
                                            <Eye className="h-3 w-3" />
                                        </Button>
                                    }
                                    {hasPermission("products.edit") && 
                                        <Button variant="ghost" size="icon"className="h-7 w-7" onClick={() => onEdit(product)}>
                                            <Edit className="h-3 w-3" />
                                        </Button>
                                    }
                                    <Button variant="ghost" size="icon"  className="h-7 w-7" onClick={() => handleArchive(product)}>
                                        <Archive className="h-3 w-3" />
                                    </Button>
                                    {hasPermission("products.delete") && 
                                        <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => onDelete(product)}>
                                            <Trash className="h-3 w-3" />
                                        </Button>
                                    }
                                </div>
                            </div>
                        </div>
                        </CardContent>
                    </Card>
                    ))
                ) : (
                    <div className="col-span-full text-center py-8 text-muted-foreground">
                    No products or services found. Add some to get started.
                    </div>
                )}
            </div>
        </main>

    );
};
