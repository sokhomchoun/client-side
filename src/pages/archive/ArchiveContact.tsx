import { useState } from "react";
import { useArchiveContact } from "@/hooks/useArchiveContact";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { PlusCircle, Search,Trash2, ArchiveRestore, Share2 } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { LoadingComponent } from "@/components/LoadingComponent";
import { Pagination } from "@/components/Pagination";

const ArchiveContact = () => {

    const {
        dataContact,
        currentPage,
        countPagination,
        itemsPerPage,
        setCurrentPage,
        setSearchTerm,
        searchTerm,
        filteredContacts,
        handleSearchContact,
        auth_id,
        handleRestoreArchive,
        setIsDeleteDialogOpen,
        setContactToDelete,
        isDeleteDialogOpen,
        handleConfirmDelete,
        handleDeletedRestoreContact,
        contactToDelete

    }  = useArchiveContact();

    return (
        <main>
            {/* <LoadingComponent isActive={loading} /> */}
            <div className="w-full">
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
                    <h1 className="text-2xl sm:text-3xl font-bold">Archive Contacts</h1>
                    <div className="flex flex-wrap gap-2">
                    </div>
                </div>

                <Card className="mb-6">
                    <CardHeader className="flex flex-col space-y-4 pb-2">
                    <div className="w-full flex flex-col lg:flex-row justify-between items-start lg:items-center space-y-4 lg:space-y-0 gap-4">
                        <div className="w-full lg:w-auto relative">
                            <div className="relative">
                                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                                <Input placeholder="Search contacts..." value={searchTerm} onChange={e => setSearchTerm(e.target.value)} className="w-full lg:w-[250px] pl-8"
                                    onKeyDown={(e) => {
                                        if (e.key === 'Enter') {
                                            handleSearchContact(searchTerm);
                                        }
                                    }}
                                />
                            </div>
                        </div>
                    </div>
                    
                    {/* Filters Section */}
                    <div className="w-full flex flex-wrap items-center gap-2 sm:gap-4 pt-2 border-t">
                        <div className="text-sm text-muted-foreground ml-auto hidden sm:block">
                            Showing {dataContact.length} of {dataContact.length} items
                        </div>
                    </div>
                    </CardHeader>
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
                                        <Button onClick={() => handleRestoreArchive(contact.id)} variant="ghost" size="sm" title="Archive">
                                            <ArchiveRestore className="h-4 w-4" />
                                        </Button>
                                        <Button onClick={() => handleDeletedRestoreContact(contact)} variant="ghost" size="sm" className="text-destructive hover:text-destructive" title="Delete Contact">
                                            <Trash2 className="h-4 w-4" />
                                        </Button>
                                    </div>
                                </TableCell>
                            </TableRow>
                        );
                    })}
                    </TableBody>
                </Table>
                </CardContent>
                </Card>
                <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
                    <AlertDialogContent>
                        <AlertDialogHeader>
                            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                            <AlertDialogDescription>
                            This will permanently delete the product {contactToDelete?.name}. This action cannot be undone.
                            </AlertDialogDescription>
                        </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel onClick={() => setContactToDelete(null)}>Cancel</AlertDialogCancel>
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
    )
}


export default ArchiveContact;