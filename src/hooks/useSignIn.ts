import { useState } from "react";
import axios from "axios";
import { toast } from "@/components/ui/sonner";
import { TClient, TUsers } from "@/types";
import { useAuth } from "@/contexts/AuthProvider";
import { useNavigate } from 'react-router-dom';
import { User } from "../tokens/token";
import { BlockModal } from "@/components/BlockModal";
import { z } from "zod";

// Login form schema
const loginSchema = z.object({
    email: z.string().email("Please enter a valid email"),
    password_hash: z.string().min(6, "Password must be at least 6 characters")
});

// Contact request form schema (replacing register schema)
const contactRequestSchema = z.object({
    name: z.string().min(2, "Name must be at least 2 characters"),
    email: z.string().email("Please enter a valid email"),
    password: z.string().min(6, "Password must be at least 6 characters"), // Fix here
    company: z.string().min(2, "Company name must be at least 2 characters"),
    location: z.string().min(2, "Location must be at least 2 characters"),
    phone_number: z.string().min(8, "Please enter a valid phone number"),
    salesTeamSize: z.number().min(1, "Sales team size must be at least 1"),
    contactsPerMonth: z.number().min(100, "Minimum 100 contacts per month")
});

// Forgot password schema
const forgotPasswordSchema = z.object({
    email: z.string().email("Please enter a valid email")
});

// Reset password schema
const resetPasswordSchema = z.object({
    password: z.string().min(8, "Password must be at least 8 characters"),
    confirmPassword: z.string().min(8, "Password must be at least 8 characters")
}).refine(data => data.password === data.confirmPassword, {
    message: "Passwords don't match",
    path: ["confirmPassword"]
});

// Define form types
type LoginFormValues = z.infer<typeof loginSchema>;
type ContactRequestFormValues = z.infer<typeof contactRequestSchema>;
type ForgotPasswordFormValues = z.infer<typeof forgotPasswordSchema>;
type ResetPasswordFormValues = z.infer<typeof resetPasswordSchema>;


export function useSignIn() {

    const { login } = useAuth();
    const navigate = useNavigate();
    
    const [authLoading, setAuthLoading] = useState<boolean>(false);
    const [isBlocked, setIsBlocked] = useState<boolean>(false);
    const [mode, setMode] = useState<"login" | "contact-request" | "forgot-password" | "verify-otp" | "reset-password">("login");
    const [resetEmail, setResetEmail] = useState("");
    const [otp, setOtp] = useState("");
    const [isLoading, setIsLoading] = useState(false);

    const onLoginSubmit = async (data: TUsers) => {
        try {
            const loginData = {
                email: data.email,
                password_hash: data.password_hash
            }
            const response = await axios.post('auth/signin', loginData);
            if (response.status === 200) {
                const {
                    access_token,
                    auth,
                    name,
                    email,
                    role,
                    avatarUrl,
                    domainList,
                    message,
                    client_id,
                    company
                } = response.data.data;

                const userData = { name, email, role, avatarUrl, domainList, client_id, company };
                toast.success(message);
                login(access_token, auth, userData);

                if (role === 'super_admin') {
                    navigate(`/super-admin`);
                } else {
                    if (!domainList) {
                        toast.error("Domain is required for non-super admin accounts.");
                        return;
                    }
                    navigate(`/${domainList}/pipelines`);
                }
                window.location.reload();
            }

        } catch (err) {
            toast.success(err.response.data.error);
            setAuthLoading(false);
            const errorMessage = err?.response?.data?.error || 'Login failed';

            if (err?.response?.status === 423) {
                setIsBlocked(true);
            } else {
                toast.error(errorMessage);
            }
            console.error("Login failed:", err?.response?.data || err.message);
        }
        
    };

    const onContactRequestSubmit = async (data: TClient) => {
        try {
            setAuthLoading(true);
            const payload = {
                email: data.email,
                password: data.password,
                name: data.name,
                company: data.company,   
                location: data.location,
                phone_number: data.phone_number
            }
            const response = await axios.post('superAdmin', payload);
             if (response.status === 201) {
                const {
                    access_token,
                    auth,
                    name,
                    email,
                    role,
                    avatarUrl,
                    domainList,
                    message,
                    client_id,
                    company
                } = response.data.data;

                const userData = { name, email, role, avatarUrl, domainList, client_id, company };
                toast.success(message);
                login(access_token, auth, userData);
                
                if (domainList) {
                    navigate(`/${domainList}/pipelines`);
                } else {
                    toast.error("Domain not returned from server.");
                }
                window.location.reload();
                setAuthLoading(false);
            }

        } catch (err) {
            toast.success(err.response.data.error);
            setAuthLoading(false);
        }
    };

    const onForgotPasswordSubmit = async (data: ForgotPasswordFormValues) => {
        setIsLoading(true);
        try {
            // Simulate API call to send OTP
            // await new Promise(resolve => setTimeout(resolve, 1000));

            
            // setResetEmail(data.email);
            // setMode("verify-otp");
            // toast.success("OTP sent to your email");
            const payload = {
                email: data.email
            }
            const response = await axios.post('otp', payload);
            if (response.status === 200) {
                setResetEmail(data.email);
                setMode("verify-otp");
                toast.success(response.data.data.message);
            }


        } catch (err) {
            const errorMessage = err?.response?.data?.error || err?.response?.data?.message || "An unexpected error occurred.";
            toast.error(errorMessage);
        } finally {
            setIsLoading(false);
        }
    };

    return {
        onLoginSubmit,
        onContactRequestSubmit,
        authLoading,
        isBlocked,
        setIsBlocked,
        onForgotPasswordSubmit,
        mode,
        setMode,
        resetEmail,
        setResetEmail,
        otp,
        setOtp,
        isLoading,
        setIsLoading

        // loginSchema,
        // contactRequestSchema,
        // forgotPasswordSchema,
        // resetPasswordSchema,
        // ContactRequestFormValues,
        // ForgotPasswordFormValues,
        // ForgotPasswordFormValues,
        // ForgotPasswordFormValues
    }
}