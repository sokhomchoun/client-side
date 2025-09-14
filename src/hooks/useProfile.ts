import axios from "axios";
import { ProvideToken, AuthId, User } from "@/tokens/token";
import { toast } from "@/components/ui/sonner";
import { useState } from "react";
import { Authorizations } from "@/utils/Authorization";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthProvider";

// Profile schema
const profileSchema = z.object({
    name: z.string().min(2, "Name must be at least 2 characters"),
    email: z.string().email("Please enter a valid email"),
    position: z.string().optional(),
    company: z.string().optional(),
    avatarUrl: z.string().optional()
});

// Password change schema
const passwordSchema = z.object({
    currentPassword: z.string().min(1, "Current password is required"),
    newPassword: z.string().min(6, "Password must be at least 6 characters"),
    confirmPassword: z.string().min(6, "Password must be at least 6 characters")
}).refine(data => data.newPassword === data.confirmPassword, {
    message: "Passwords don't match",
    path: ["confirmPassword"]
});

type ProfileFormValues = z.infer<typeof profileSchema>;
type PasswordFormValues = z.infer<typeof passwordSchema>;

export function useProfile() {
    const { user } = useAuth();
    const token = ProvideToken();
    const navigate = useNavigate();
    const auth_id = AuthId();
    const { domain } = User();

    const [selectedFile, setSelectedFile] = useState<File | null>(null);
    const [avatarUrl, setAvatarUrl] = useState(user?.avatarUrl || "/profile-placeholder.jpg");

    // Profile form
    const profileForm = useForm<ProfileFormValues>({
        resolver: zodResolver(profileSchema),
        defaultValues: {
            name: user?.name || "",
            email: user?.email || "",
            position: user?.role || "",
            company: user?.company || "",
            avatarUrl: user?.avatarUrl || ""
        }
    });

    // Password form
    const passwordForm = useForm<PasswordFormValues>({
        resolver: zodResolver(passwordSchema),
        defaultValues: {
            currentPassword: "",
            newPassword: "",
            confirmPassword: ""
        }
    });

    const handleImageChange = (file: File | null) => {
        if (!file) return;
        const previewUrl = URL.createObjectURL(file);
        setAvatarUrl(previewUrl); 
        setSelectedFile(file); 
    };

    // Profile submit
    const onProfileSubmit = async (values: ProfileFormValues) => {
        try {
            const form = new FormData();
            form.append("name", values.name);
            form.append("email", values.email);
            form.append("domain", domain);

            if (values.company) form.append("company", values.company);
            if (selectedFile) {
                form.append("avatar_url", selectedFile);
            }

            const response = await axios.put(`profile/${auth_id}`, form, { 
                headers: Authorizations(token)
            });

            if (response.status === 200) {
                const data = response.data.data;
                const authString = localStorage.getItem("auth");
                let authObj = authString ? JSON.parse(authString) : [];

                if (authObj.length > 0) {
                    authObj[0].user = {
                        ...authObj[0].user,
                        avatarUrl: data.avatar_url || avatarUrl,
                        name: values.name,
                        email: values.email
                    };
                }

                localStorage.setItem("auth", JSON.stringify(authObj));
                if (data.avatar_url) setAvatarUrl(data.avatar_url);
                window.location.reload();
                toast.success(data.message);
            }
        } catch (err: any) {
            const errorMessage = err?.response?.data?.error || err?.response?.data?.message || "An unexpected error occurred.";
            toast.error(errorMessage);
        }
    };

    const onPasswordSubmit = async (data: PasswordFormValues) => {
        try {
            const payload = {
                current_password: data.currentPassword,
                new_password: data.newPassword,
                confirm_password: data.confirmPassword
            }
            const response = await axios.put(`profile/password/${auth_id}`, payload, {
                headers: Authorizations(token)
            });
            if (response.status === 200) {
                toast.success(response.data.data.message);
            }
        } catch (err) {
            const errorMessage = err?.response?.data?.error || err?.response?.data?.message || "An unexpected error occurred.";
            toast.error(errorMessage);
        }
    };


    return {
        onProfileSubmit,
        profileSchema,
        passwordSchema,
        profileForm,
        passwordForm,
        user,
        avatarUrl,
        setAvatarUrl,
        handleImageChange,
        onPasswordSubmit
    };
}
