import { useState, useMemo } from "react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { toast } from "sonner";
import { Upload, Download, FileText, Check, X } from "lucide-react";
import * as XLSX from 'xlsx';
import { User } from "@/tokens/token";
import { TClient } from "@/types";

type ContactCategory = {
    id: string;
    name: string;
    color: string;
};
type CSVRow = {
    [key: string]: string;
};

type Step = 'upload' | 'mapping' | 'preview';

interface ContactsImportProps {
    categories: ContactCategory[];
    handleImport: () => void;
    csvData: CSVRow[];
    setCsvData: React.Dispatch<React.SetStateAction<CSVRow[]>>;
    isOpen: boolean;
    setIsOpen: React.Dispatch<React.SetStateAction<boolean>>;
    step: Step;
    setStep: React.Dispatch<React.SetStateAction<Step>>;
    loading: boolean;
    dataClient: TClient[]
}

const ContactsImport = ({ 
      categories,
        handleImport,
        csvData,
        setCsvData,
        isOpen,
        setIsOpen,
        step,
        setStep,
        dataClient
    }: ContactsImportProps) => {
    
    const systemFields = [
        { value: 'name', label: 'domain *', required: true },
        { value: 'email', label: 'email *', required: true },
        { value: 'phone', label: 'phone', required: false },
        { value: 'company', label: 'company *', required: true },
        { value: 'position', label: 'position' },
        { value: 'website', label: 'website' },
        { value: 'category', label: 'category *', required: true},
        { value: 'address', label: 'address' },
        { value: 'map_link', label: 'map_link' },
        { value: 'notes', label: 'notes' },
        
    ];

    const readExcelFile = (file: File): Promise<any[]> => {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.onload = (e) => {
                const data = e.target?.result;
                if (!data) return reject('File read failed');
                try {
                    const workbook = XLSX.read(data, { type: 'array' });
                    const firstSheetName = workbook.SheetNames[0];
                    const worksheet = workbook.Sheets[firstSheetName];
                    // Parse and normalize keys
                    const jsonDataRaw = XLSX.utils.sheet_to_json(worksheet, { defval: '' });
                    const jsonData = jsonDataRaw.map(row => {
                        const cleaned: Record<string, any> = {};
                        Object.keys(row).forEach(key => {
                            cleaned[key.trim()] = row[key];
                        });
                        return cleaned;
                    });
                    resolve(jsonData);
                } catch (error) {
                    reject(error);
                }
            };
            reader.onerror = () => reject('File reading error');
            reader.readAsArrayBuffer(file);
        });
    };

    const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        if (!e.target.files?.length) return;
        const file = e.target.files[0];
        try {
            const data = await readExcelFile(file);
            setCsvData(data);
            setStep('preview');
        } catch (err) {
            console.error('Error reading excel file:', err);
        }
    };

    const handleCancelContact = () => {
        setIsOpen(false);
        setStep('upload');
        setCsvData([]);
    }
    const downloadTemplate = () => {
        const headers = systemFields.map(field => field.label.replace(' *', ''));
        const sampleData = [
            'John Doe',
            'john@example.com',
            '555-1234',
            'Example Corp',
            'CEO',
            'https://example.com',
            categories[0]?.name || 'Client',
            '123 Main St-City-State',
            'Link Map',
            'Sample Notes',
        ];
        const csvContent = [
            headers.join(','),
            sampleData.join(',')
        ].join('\n');

        const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
        const link = document.createElement('a');
        const url = URL.createObjectURL(blob);
        link.setAttribute('href', url);
        link.setAttribute('download', 'contacts_template.csv');
        link.style.visibility = 'hidden';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        
        toast.success("Template CSV downloaded successfully!");
    };

    const isContactLimitReached = useMemo(() => {
        if (!dataClient || dataClient.length === 0) return false;

        const client = dataClient[0];

        const usage = parseInt(client.client_usage?.[0]?.contact_usage || "0", 10);
        const limit = parseInt(client.limited_contact || "0", 10);

        return usage >= limit;
    }, [dataClient]);

    return (
        <main>
            {/* <LoadingComponent isActive={loading} /> */}
            <Dialog open={isOpen} onOpenChange={(open) => {
                setIsOpen(open);
                if (!open) {
                    setStep('upload');
                    setCsvData([]);
                }
            }}>
            {/* <DialogTrigger asChild> */}
                <Button variant="outline" size="sm" 
                    onClick={() => {
                        if (isContactLimitReached) {
                            toast.error("You have reached your contact limit. Please upgrade your plan.");
                            return;
                        }
                        setIsOpen(true);

                    }}
                >
                <Download className="h-4 w-4 mr-1" /> 
                    Import Contacts
                </Button>
            {/* </DialogTrigger> */}
            <DialogContent className="sm:max-w-[800px] max-h-[90vh] overflow-hidden">
                <DialogHeader>
                    <DialogTitle>Import Contacts from CSV</DialogTitle>
                    <DialogDescription>
                        Upload a CSV file to import multiple contacts at once
                    </DialogDescription>
                </DialogHeader>
                <div className="flex-1 overflow-y-auto py-4">
                {step === 'upload' && (
                    <div className="space-y-6">
                        <div className="text-center border-2 border-dashed border-muted-foreground/25 rounded-lg p-8">
                            <FileText className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
                            <div className="space-y-4">
                            <div>
                                <h3 className="text-lg font-medium">Upload CSV File</h3>
                                <p className="text-sm text-muted-foreground">
                                Select a CSV file containing your contact information
                                </p>
                            </div>
                            <Input type="file" accept=".csv" onChange={handleFileUpload} className="max-w-sm mx-auto"/>
                            </div>
                        </div>
                        <div className="space-y-4">
                            <div className="flex items-center justify-between">
                                <h4 className="font-medium">Need a template?</h4>
                                <Button variant="outline" size="sm" onClick={downloadTemplate}>
                                    <Download className="h-4 w-4 mr-1" />
                                    Download Template
                                </Button>
                            </div>
                            <p className="text-sm text-muted-foreground">
                                Download our CSV template with the correct format and sample data to get started quickly.
                            </p>
                        </div>
                    </div>
                )}
                {step === 'preview' && (
                    <div className="space-y-6">
                    <Card>
                        <CardHeader>
                            <CardTitle className="text-base">
                                Preview ({csvData.length} contacts total)
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="p-0">
                        <Table>
                            <TableHeader>
                            <TableRow>
                                <TableHead>Name</TableHead>
                                <TableHead>Email</TableHead>
                                <TableHead>Company</TableHead>
                                <TableHead>Category</TableHead>
                                <TableHead>Phone</TableHead>
                                <TableHead>Position</TableHead>
                            </TableRow>
                            </TableHeader>
                            <TableBody>
                                {csvData.slice(0, 5).map((contact, index) => (
                                    <TableRow key={index}>
                                    <TableCell>{contact.name || '-'}</TableCell>
                                    <TableCell>{contact.email || '-'}</TableCell>
                                    <TableCell>{contact.company || '-'}</TableCell>
                                    <TableCell>{contact.category || '-'}</TableCell>
                                    <TableCell>{contact.phone || '-'}</TableCell>
                                    <TableCell>{contact.position || '-'}</TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                        </CardContent>
                    </Card>
                    <div className="space-y-2">
                        <h4 className="font-medium">Import Summary</h4>
                        <div className="grid grid-cols-2 gap-4 text-sm">
                            <div className="flex items-center space-x-2">
                                <Check className="h-4 w-4 text-green-500" />
                                <span>Total contacts: {csvData.length}</span>
                            </div>
                            <div className="flex items-center space-x-2">
                                <Check className="h-4 w-4 text-green-500" />
                                <span>Required fields mapped</span>
                            </div>
                        </div>
                    </div>
                    <div className="flex space-x-2 justify-end">
                        <Button variant="outline" onClick={handleCancelContact}>
                            Cancel
                        </Button>
                        <Button onClick={handleImport}>
                            Import {csvData.length} Contacts
                        </Button>
                    </div>
                    </div>
                )}
                </div>
            </DialogContent>
            </Dialog>
        </main>
       
    );
};

export default ContactsImport;
