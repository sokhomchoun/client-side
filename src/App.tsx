import React from "react";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider } from "./contexts/AuthProvider";
import { LanguageProvider } from "./contexts/LanguageContext";
import { ThemeProvider } from "./components/ThemeProvider";
import Layout from "./components/Layout";
import Deals from "./pages/Deals";
import Pipelines from "./pages/Pipelines";
import Contacts from "./pages/Contacts";
import NotFound from "./pages/NotFound";
import Auth from "./pages/Auth";
import Profile from "./pages/Profile";
import Settings from "./pages/Settings";
import Tasks from "./pages/Tasks";
import Sales from "./pages/Sales";
import Products from "./pages/Products";
import Notes from "./pages/Notes";
import Library from "./pages/Library";
import Admin from "./pages/Admin";
import BillingBlock from "./pages/BillingBlock";
import SuperAdmin from "./pages/SuperAdmin";
import ArchiveProduct from "./pages/archive/ArchiveProduct";
import ArchiveContact from "./pages/archive/ArchiveContact";
import PrivateRoute from "./contexts/PrivateRoute";
import DownloadFile from "./pages/DownloadFile";
import { CurrencyProvider } from "./contexts/CurrencyContext";
import ProtectedRoute from "./contexts/ProtectRoute";
import { useUrl } from "./hooks/useUrl";

const queryClient = new QueryClient();
const App = () => {
    const { dataUrl, isDomain } = useUrl();

    const hasDomainData = dataUrl && isDomain;

    const allowedRoutes = hasDomainData
        ? Array.from(new Set([
            `/${isDomain}/pipelines`,
            ...dataUrl.map(item => `/${isDomain}/${item.url}`)
        ]))
        : [];

    const firstAllowedPath = allowedRoutes.length > 0 ? allowedRoutes[0] : "/auth";

    return (
        <ThemeProvider defaultTheme="system" storageKey="vite-ui-theme">
            <LanguageProvider>
                <QueryClientProvider client={queryClient}>
                    <BrowserRouter>
                        <AuthProvider>
                            <CurrencyProvider>
                                <TooltipProvider>
                                    <Toaster />
                                    <Sonner />
                                    <Routes>
                                        {/* Public routes - always available */}
                                        <Route path="/auth" element={<Auth />} />
                                        <Route path="/billing-block" element={<BillingBlock />} />
                                        <Route path="/" element={<Navigate to={firstAllowedPath} replace />} />
                                        <Route path="/download-file" element={<DownloadFile />} />

                                        {/* Super Admin route - without domain */}
                                        <Route path="/super-admin" element={
                                            <ProtectedRoute allowedRoutes={allowedRoutes}>
                                                <Layout><SuperAdmin /></Layout>
                                            </ProtectedRoute>
                                        } />

                                        {/* Protected routes - only render if domain info is ready */}
                                        {hasDomainData && (
                                            <Route element={<PrivateRoute />}>
                                                <Route path={`/:domain/pipelines`} element={
                                                    <ProtectedRoute allowedRoutes={allowedRoutes}>
                                                        <Layout><Pipelines /></Layout>
                                                    </ProtectedRoute>
                                                } />
                                                <Route path={`/:domain/pipelines/deals`} element={
                                                    <ProtectedRoute allowedRoutes={allowedRoutes}>
                                                        <Layout><Deals /></Layout>
                                                    </ProtectedRoute>
                                                } />
                                                <Route path={`/:domain/pipelines/tasks`} element={
                                                    <ProtectedRoute allowedRoutes={allowedRoutes}>
                                                        <Layout><Tasks /></Layout>
                                                    </ProtectedRoute>
                                                } />
                                                <Route path={`/:domain/pipelines/contacts`} element={
                                                    <ProtectedRoute allowedRoutes={allowedRoutes}>
                                                        <Layout><Contacts /></Layout>
                                                    </ProtectedRoute>
                                                } />
                                                <Route path={`/:domain/pipelines/products`} element={
                                                    <ProtectedRoute allowedRoutes={allowedRoutes}>
                                                        <Layout><Products /></Layout>
                                                    </ProtectedRoute>
                                                } />
                                                <Route path={`/:domain/pipelines/archive-products`} element={
                                                    <ProtectedRoute allowedRoutes={allowedRoutes}>
                                                        <Layout><ArchiveProduct /></Layout>
                                                    </ProtectedRoute>
                                                } />
                                                <Route path={`/:domain/pipelines/archive-contacts`} element={
                                                    <ProtectedRoute allowedRoutes={allowedRoutes}>
                                                        <Layout><ArchiveContact /></Layout>
                                                    </ProtectedRoute>
                                                } />
                                                <Route path={`/:domain/pipelines/sales`} element={
                                                    <ProtectedRoute allowedRoutes={allowedRoutes}>
                                                        <Layout><Sales /></Layout>
                                                    </ProtectedRoute>
                                                } />
                                                <Route path={`/:domain/pipelines/notes`} element={
                                                    <ProtectedRoute allowedRoutes={allowedRoutes}>
                                                        <Layout><Notes /></Layout>
                                                    </ProtectedRoute>
                                                } />
                                                <Route path={`/:domain/library`} element={
                                                    <ProtectedRoute allowedRoutes={allowedRoutes}>
                                                        <Layout><Library /></Layout>
                                                    </ProtectedRoute>
                                                } />
                                                <Route path={`/:domain/admin`} element={
                                                    <ProtectedRoute allowedRoutes={allowedRoutes}>
                                                        <Layout><Admin /></Layout>
                                                    </ProtectedRoute>
                                                } />
                                                <Route path={`/:domain/profile`} element={
                                                    <ProtectedRoute allowedRoutes={allowedRoutes}>
                                                        <Layout><Profile /></Layout>
                                                    </ProtectedRoute>
                                                } />
                                                <Route path={`/:domain/settings`} element={
                                                    <ProtectedRoute allowedRoutes={allowedRoutes}>
                                                        <Layout><Settings /></Layout>
                                                    </ProtectedRoute>
                                                } />
                                            </Route>
                                        )} 

                                        {/* Catch-all fallback */}
                                        <Route path="*" element={<Layout><NotFound /></Layout>} />
                                    </Routes>
                                </TooltipProvider>
                            </CurrencyProvider>
                        </AuthProvider>
                    </BrowserRouter>
                </QueryClientProvider>
            </LanguageProvider>
        </ThemeProvider>
    );
};

export default App;
