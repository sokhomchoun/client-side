import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useAuth } from "@/contexts/AuthProvider";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Slider } from "@/components/ui/slider";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { InputOTP, InputOTPGroup, InputOTPSlot } from "@/components/ui/input-otp";
import { toast } from "@/components/ui/sonner";
import { ArrowLeft, Mail, Phone, Eye, EyeOff } from "lucide-react";
import { useSignIn } from "@/hooks/useSignIn";
import { AuthLoadingComponent } from "@/components/AuthLoadingComponent";
import { BlockModal } from "@/components/BlockModal";


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

// // Define form types
type LoginFormValues = z.infer<typeof loginSchema>;
type ContactRequestFormValues = z.infer<typeof contactRequestSchema>;
type ForgotPasswordFormValues = z.infer<typeof forgotPasswordSchema>;
type ResetPasswordFormValues = z.infer<typeof resetPasswordSchema>;

const Auth = () => {
    // const [mode, setMode] = useState<"login" | "contact-request" | "forgot-password" | "verify-otp" | "reset-password">("login");
    // const [resetEmail, setResetEmail] = useState("");
    // const [otp, setOtp] = useState("");
    // const [isLoading, setIsLoading] = useState(false);
    // Login form
    const loginForm = useForm<LoginFormValues>({
        resolver: zodResolver(loginSchema),
        defaultValues: {
            email: "",
            password_hash: ""
        }
    });

    const { 
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

    } = useSignIn();



    // Contact request form (replacing register form)
    const contactRequestForm = useForm<ContactRequestFormValues>({
        resolver: zodResolver(contactRequestSchema),
            defaultValues: {
            name: "",
            email: "",
            password: "",
            company: "",
            location: "",
            phone_number: "",
            salesTeamSize: 1,
            contactsPerMonth: 500
        }
    });

    // Forgot password form
    const forgotPasswordForm = useForm<ForgotPasswordFormValues>({
        resolver: zodResolver(forgotPasswordSchema),
        defaultValues: {
            email: ""
        }
    });

    // Reset password form
    const resetPasswordForm = useForm<ResetPasswordFormValues>({
        resolver: zodResolver(resetPasswordSchema),
        defaultValues: {
        password: "",
        confirmPassword: ""
        }
    });

    // Handle forgot password form submission
    // const onForgotPasswordSubmit = async (data: ForgotPasswordFormValues) => {
    //     setIsLoading(true);
    //     try {
    //         // Simulate API call to send OTP
    //         await new Promise(resolve => setTimeout(resolve, 1000));
            
    //         setResetEmail(data.email);
    //         setMode("verify-otp");
    //         toast.success("OTP sent to your email");
    //     } catch (error) {
    //         toast.error("Failed to send OTP");
    //     } finally {
    //         setIsLoading(false);
    //     }
    // };

    // Handle OTP verification
    const handleOtpVerification = async () => {
        if (otp.length !== 6) {
            toast.error("Please enter a valid 6-digit OTP");
            return;
        }

        setIsLoading(true);
        try {
        // Simulate API call to verify OTP
            await new Promise(resolve => setTimeout(resolve, 1000));
            
            // For demo purposes, accept any 6-digit OTP
            setMode("reset-password");
            toast.success("OTP verified successfully");
        } catch (error) {
            toast.error("Invalid OTP");
        } finally {
            setIsLoading(false);
        }
    };

    // Handle reset password form submission
    const onResetPasswordSubmit = async (data: ResetPasswordFormValues) => {
        setIsLoading(true);
        try {
            // Simulate API call to reset password
            await new Promise(resolve => setTimeout(resolve, 1000));
            
            toast.success("Password reset successfully");
            setMode("login");
            // Clear forms
            forgotPasswordForm.reset();
            resetPasswordForm.reset();
            setOtp("");
            setResetEmail("");
        } catch (error) {
            toast.error("Failed to reset password");
        } finally {
            setIsLoading(false);
        }
    };

    // Toggle between login and contact request forms
    const toggleMode = () => {
        setMode(mode === "login" ? "contact-request" : "login");
    };

    const goBackToLogin = () => {
        setMode("login");
        setOtp("");
        setResetEmail("");
        forgotPasswordForm.reset();
        resetPasswordForm.reset();
    };

    return (
        <main>
            <AuthLoadingComponent isActive={authLoading} />
            <BlockModal isOpen={isBlocked} onClose={() => setIsBlocked(false)} />
            <div className="flex items-center justify-center min-h-screen bg-gray-50">
                <div className="w-full max-w-md p-4">
                    <div className="flex justify-center mb-6">
                        <Link to="/">
                            <img alt="Mangrove Studio" className="h-16" src="/lovable-uploads/daa5d3f6-9c34-4316-a0a1-b80c8d48e5c4.png" />
                        </Link>
                    </div>

                    {mode === "login" && (
                        <Card>
                            <CardHeader>
                            <CardTitle>Login</CardTitle>
                            <CardDescription>
                                Enter your credentials to access your account
                            </CardDescription>
                            </CardHeader>
                            <CardContent>
                            <Form {...loginForm}>
                                <form onSubmit={loginForm.handleSubmit(onLoginSubmit)} className="space-y-4">
                                <FormField
                                    control={loginForm.control}
                                    name="email"
                                    render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Email</FormLabel>
                                        <FormControl>
                                        <Input placeholder="Enter your email" {...field} />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                    )}
                                />
                                <FormField
                                    control={loginForm.control}
                                    name="password_hash"
                                    render={({ field }) => {
                                        const [showPassword, setShowPassword] = useState(false)
                                        return (
                                            <FormItem>
                                                <FormLabel>Password</FormLabel>
                                                <FormControl>
                                                    <div className="relative">
                                                        <Input type={showPassword ? "text" : "password"} placeholder="••••••••" {...field} />
                                                        <button type="button" onClick={() => setShowPassword((prev) => !prev)} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700">
                                                        {showPassword ? (
                                                            <Eye className="h-5 w-5" />
                                                        ) : (
                                                            <EyeOff className="h-5 w-5" />
                                                        )}
                                                        </button>
                                                    </div>
                                                </FormControl>
                                                <FormMessage />
                                            </FormItem>
                                        )
                                    }}
                                />
                                <Button type="submit" className="w-full">
                                    Login
                                </Button>
                                </form>
                            </Form>
                            </CardContent>
                            <CardFooter className="flex flex-col space-y-2">
                            <Button variant="link" onClick={() => setMode("forgot-password")}>
                                Forgot your password?
                            </Button>
                            <Button variant="link" onClick={toggleMode}>
                                Don't have an account? Request Access
                            </Button>
                            </CardFooter>
                        </Card>
                    )}

                    {mode === "contact-request" && (
                    <Card>
                        <CardHeader>
                        <CardTitle>Request Access</CardTitle>
                        <CardDescription>
                            Fill out this form and our sales team will contact you shortly to set up your account
                        </CardDescription>
                        </CardHeader>
                        <CardContent>
                        <Form {...contactRequestForm}>
                            <form onSubmit={contactRequestForm.handleSubmit(onContactRequestSubmit)} className="space-y-4">
                            <FormField
                                control={contactRequestForm.control}
                                name="name"
                                render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Full Name</FormLabel>
                                    <FormControl>
                                    <Input placeholder="Enter your full name" {...field} />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                                )}
                            />
                            <FormField
                                control={contactRequestForm.control}
                                name="email"
                                render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Email</FormLabel>
                                    <FormControl>
                                    <Input placeholder="Enter your work email" {...field} />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                                )}
                            />
                            <FormField
                                control={contactRequestForm.control}
                                name="password"
                                render={({ field }) => {
                                    const [showPassword, setShowPassword] = useState(false)
                                    return (
                                        <FormItem>
                                            <FormLabel>Password</FormLabel>
                                            <FormControl>
                                                <div className="relative">
                                                    <Input type={showPassword ? "text" : "password"} placeholder="Enter your work password" {...field} />
                                                    <button type="button" onClick={() => setShowPassword((prev) => !prev)} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700" tabIndex={-1} >
                                                    {showPassword ? (
                                                        <Eye className="h-5 w-5" />
                                                    ) : (
                                                        <EyeOff className="h-5 w-5" />
                                                    )}
                                                    </button>
                                                </div>
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )
                                }}
                            />
                            <FormField
                                control={contactRequestForm.control}
                                name="company"
                                render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Company Name</FormLabel>
                                    <FormControl>
                                    <Input placeholder="Enter your company name" {...field} />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                                )}
                            />
                            <FormField
                                control={contactRequestForm.control}
                                name="location"
                                render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Location</FormLabel>
                                    <FormControl>
                                    <Input placeholder="City, Country" {...field} />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                                )}
                            />
                            <FormField
                                control={contactRequestForm.control}
                                name="phone_number"
                                render={({ field }) => (
                                <FormItem>
                                    <FormLabel className="flex items-center gap-2">
                                        <Phone className="h-4 w-4" />
                                        Phone Number
                                    </FormLabel>
                                    <FormControl>
                                        <Input placeholder="+(885) 123-4567" {...field} />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                                )}
                            />
                            <Button type="submit" className="w-full" disabled={isLoading}>
                                {isLoading ? "Submitting..." : "Submit Request"}
                            </Button>
                            </form>
                        </Form>
                        </CardContent>
                        <CardFooter className="flex justify-center">
                        <Button variant="link" onClick={toggleMode}>
                            Already have an account? Login
                        </Button>
                        </CardFooter>
                    </Card>
                    )}

                    {/* {mode === "forgot-password" && (
                        <Card>
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2">
                                    <Mail className="h-5 w-5" />
                                    Forgot Password
                                </CardTitle>
                                <CardDescription>
                                    Enter your email address and we'll send you an OTP to reset your password
                                </CardDescription>
                                </CardHeader>
                            <CardContent>
                            <Form {...forgotPasswordForm}>
                                <form onSubmit={forgotPasswordForm.handleSubmit(onForgotPasswordSubmit)} className="space-y-4">
                                    <FormField
                                        control={forgotPasswordForm.control}
                                        name="email"
                                        render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Email</FormLabel>
                                            <FormControl>
                                            <Input placeholder="Enter your email" {...field} />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                        )}
                                    />
                                    <Button type="submit" className="w-full" disabled={isLoading}>
                                        {isLoading ? "Sending..." : "Send OTP"}
                                    </Button>
                                </form>
                            </Form>
                            </CardContent>
                            <CardFooter>
                            <Button variant="link" onClick={goBackToLogin} className="w-full">
                                <ArrowLeft className="h-4 w-4 mr-2" />
                                Back to Login
                            </Button>
                            </CardFooter>
                        </Card>
                    )} */}



{mode === "forgot-password" && (
  <Card>
    <CardHeader>
      <CardTitle className="flex items-center gap-2">
        <Mail className="h-5 w-5" />
        Forgot Password
      </CardTitle>
      <CardDescription>
        Enter your email address and we'll send you an OTP to reset your password
      </CardDescription>
    </CardHeader>
    <CardContent className="space-y-4">
      {/* Notification Permission Card */}
      {/* <NotificationPermissionCard
        notificationStatus={notificationStatus}
        onEnableNotifications={enableNotifications}
        isLoading={isLoading}
      /> */}
      
      {/* Forgot Password Form */}
      <Form {...forgotPasswordForm}>
        <form onSubmit={forgotPasswordForm.handleSubmit(onForgotPasswordSubmit)} className="space-y-4">
          <FormField
            control={forgotPasswordForm.control}
            name="email"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Email</FormLabel>
                <FormControl>
                  <Input placeholder="Enter your email" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <Button type="submit" className="w-full" disabled={isLoading}>
            {isLoading ? "Sending..." : "Send OTP"}
          </Button>
        </form>
      </Form>
    </CardContent>
    <CardFooter>
      <Button variant="link" onClick={goBackToLogin} className="w-full">
        <ArrowLeft className="h-4 w-4 mr-2" />
        Back to Login
      </Button>
    </CardFooter>
  </Card>
)}



                    {mode === "verify-otp" && (
                        <Card>
                            <CardHeader>
                                <CardTitle>Verify OTP</CardTitle>
                                <CardDescription>
                                    Enter the 6-digit code sent to {resetEmail}
                                </CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div className="flex flex-col items-center space-y-4">
                                    <InputOTP maxLength={6} value={otp} onChange={setOtp}>
                                    <InputOTPGroup>
                                        <InputOTPSlot index={0} />
                                        <InputOTPSlot index={1} />
                                        <InputOTPSlot index={2} />
                                        <InputOTPSlot index={3} />
                                        <InputOTPSlot index={4} />
                                        <InputOTPSlot index={5} />
                                    </InputOTPGroup>
                                    </InputOTP>
                                    <Button onClick={handleOtpVerification} className="w-full" disabled={isLoading || otp.length !== 6}>
                                        {isLoading ? "Verifying..." : "Verify OTP"}
                                    </Button>
                                </div>
                            </CardContent>
                            <CardFooter>
                                <Button variant="link" onClick={goBackToLogin} className="w-full">
                                    <ArrowLeft className="h-4 w-4 mr-2" />
                                    Back to Login
                                </Button>
                            </CardFooter>
                        </Card>
                    )}

                    {mode === "reset-password" && (
                    <Card>
                        <CardHeader>
                            <CardTitle>Reset Password</CardTitle>
                            <CardDescription>
                                Enter your new password
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                        <Form {...resetPasswordForm}>
                            <form onSubmit={resetPasswordForm.handleSubmit(onResetPasswordSubmit)} className="space-y-4">
                                <FormField
                                    control={resetPasswordForm.control}
                                    name="password"
                                    render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>New Password</FormLabel>
                                        <FormControl>
                                            <Input type="password" placeholder="••••••••" {...field} />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                    )}
                                />
                                <FormField
                                    control={resetPasswordForm.control}
                                    name="confirmPassword"
                                    render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Confirm New Password</FormLabel>
                                        <FormControl>
                                            <Input type="password" placeholder="••••••••" {...field} />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                    )}
                                />
                                <Button type="submit" className="w-full" disabled={isLoading}>
                                    {isLoading ? "Resetting..." : "Reset Password"}
                                </Button>
                            </form>
                        </Form>
                        </CardContent>
                        <CardFooter>
                            <Button variant="link" onClick={goBackToLogin} className="w-full">
                                <ArrowLeft className="h-4 w-4 mr-2" />
                                Back to Login
                            </Button>
                        </CardFooter>
                    </Card>
                    )}
                </div>
            </div>
        </main>
      
    );
};

export default Auth;
