import { useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Upload, X } from "lucide-react";

interface ImageUploadProps {
  currentImage: string;
  onImageChange: (file: File | null) => void; // allow null when removing
}

const ImageUpload = ({ currentImage, onImageChange }: ImageUploadProps) => {
    const [previewUrl, setPreviewUrl] = useState<string | null>(currentImage || null);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        if (!file.type.match("image.*")) {
            alert("Please select an image file");
            return;
        }

        if (file.size > 5 * 1024 * 1024) {
            alert("File size should be less than 5MB");
            return;
        }

        const reader = new FileReader();
        reader.onload = () => {
            const result = reader.result as string;
            setPreviewUrl(result); // this is the base64 string for preview
        };
        reader.readAsDataURL(file);

        onImageChange(file); // pass the actual File object
    };

    const handleButtonClick = () => {
        fileInputRef.current?.click();
    };

    const handleRemoveImage = () => {
        setPreviewUrl(null);
        onImageChange(null);
        if (fileInputRef.current) fileInputRef.current.value = "";
    };
  

    return (
        <div className="flex flex-col items-center gap-4">
            <input
                type="file"
                ref={fileInputRef}
                onChange={handleFileChange}
                accept="image/*"
                className="hidden"
            />
            <Button type="button" variant="outline" size="sm" onClick={handleButtonClick}>
                <Upload className="mr-2 h-4 w-4" />
                {previewUrl ? "Change Photo" : "Upload Photo"}
            </Button>
        </div>
    );
};

export default ImageUpload;
