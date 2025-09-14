import { useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { Contact, CircleDollarSign, DollarSign, CheckSquare, Package, FolderOpen, GitBranch, StickyNote, Library, Settings, Shield } from "lucide-react";
import { Sidebar as SidebarComponent, SidebarContent, SidebarMenu, SidebarMenuItem, SidebarMenuButton, SidebarFooter, SidebarRail, useSidebar, SidebarHeader, SidebarGroup, SidebarGroupContent } from "@/components/ui/sidebar";
import { Button } from "@/components/ui/button";
import { useUrl } from "@/hooks/useUrl";
import { User, ProvideToken, AuthId } from "@/tokens/token";
import { LoadingComponent } from "./LoadingComponent";
import { useTranslation } from 'react-i18next';
import { useEffect } from "react";
import { Authorizations } from "@/utils/Authorization";
import { TClient } from "@/types";
import axios from "axios";
import { toast } from "@/components/ui/sonner";

interface SidebarProps {
    currentPath: string;
}
const menuItems = [{
    title: "menu.pipeline",
    url: "/pipelines",
    icon: GitBranch,
    description: "Configure pipeline"
}, 
{
    title: "menu.contacts",
    url: "/pipelines/contacts",
    icon: Contact,
    description: "Manage contacts"
}, {
    title: "Tasks",
    url: "/pipelines/tasks",
    icon: CheckSquare,
    description: "Track your tasks"
}, {
    title: "Products",
    url: "/pipelines/products",
    icon: Package,
    description: "Product catalog"
}, {
    title: "Notes",
    url: "/pipelines/notes",
    icon: StickyNote,
    description: "Your notes"
}, {
    title: "Library",
    url: "/library",
    icon: Library,
    description: "Document library"
}, {
    title: "Analytics",
    url: "/pipelines/sales",
    icon: DollarSign,
    description: "Sales analytics"
}, {
    title: "Admin",
    url: "/admin",
    icon: Settings,
    description: "User & role management"
}, {
    title: "Super Admin",
    url: "/super-admin",
    icon: Shield,
    description: "Client portal management"
}];

const Sidebar = ({ currentPath }: SidebarProps) => {
    const { state } = useSidebar();
    const location = useLocation();
    const auth_id = AuthId();
    const { role, domain } = User();
    const { dataUrl, loading, isDomain } = useUrl();
    const { t, i18n } = useTranslation();
    const [dataClient, setDataClient] = useState<TClient[]>([]);
    const token = ProvideToken();
    
    const allowedUrls = dataUrl?.map((item) => `/${isDomain}/${item.url}`) || [];
    
    const isActive = (path: string) => {
        const fullPath = `/${isDomain}${path}`;
        return location.pathname === fullPath;
    };

    const handleGetClientPermission = async () => {
        try {
            const payload = { domain: domain }
            const response = await axios.get(`haspermission/client/${auth_id}`, {
                params: payload,
                headers: Authorizations(token)
            });
            if (response.status === 200) {
                setDataClient(response.data.data)
                
            }
        } catch (err) {
            const errorMessage = err?.response?.data?.error || err?.response?.data?.message || "An unexpected error occurred.";
            toast.error(errorMessage);
        }
    };

    const hasPipeline = () => {
        if (dataClient.length > 0) {
            return dataClient[0].pipeline === true;
        }
        return false;
    };

    useEffect(() => {
        handleGetClientPermission();
    },[])
    

    return (
        <main>
            <LoadingComponent isActive={loading} />
            <div className={role === 'super_admin' ? 'hidden' : ''}>
                <SidebarComponent variant="sidebar" collapsible="icon" className="border-r border-[#f9f9f914] dark:border-sidebar-border">
                    <SidebarRail />
                    <SidebarHeader className="border-b border-[#f9f9f914] dark:border-sidebar-border bg-[#051438] dark:bg-sidebar">
                        <div className={`flex items-center transition-all duration-300 ${ state === "collapsed" ? "justify-center p-2" : "justify-center p-4"}`}>
                            <Link to={`/${isDomain}/pipelines`} className="flex items-center">
                                {state === "collapsed" ? (
                                    <>
                                        <img src="/sellmeapp-uploads/icon.png" alt="SellMeApp Icon" className="h-8 max-w-fit object-contain dark:hidden" />
                                        <img src="/sellmeapp-uploads/icon-white.png" alt="SellMeApp Icon Dark" className="h-8 max-w-fit object-contain hidden dark:block" />
                                    </>
                                ) : (
                                    <>
                                        <img src="/sellmeapp-uploads/logo-white.png" alt="SellMeApp Logo" className="h-8 w-[80%] object-contain dark:hidden" />
                                        <img  src="/sellmeapp-uploads/logo-black.png" alt="SellMeApp Logo Dark" className="h-8 w-[80%] object-contain hidden dark:block" />
                                    </>
                                )}
                            </Link>
                        </div>
                    </SidebarHeader>
                    <SidebarContent className="bg-[#051438] dark:bg-sidebar">
                        <SidebarGroup>
                            <SidebarGroupContent>
                                <SidebarMenu className={`space-y-1 ${state === "collapsed" ? "p-2" : "p-2"}`}>
                                    <SidebarMenu className={`space-y-1 ${state === "collapsed" ? "p-2" : "p-2"}`}>
                                    {menuItems
                                        .filter(item => {
                                            if (role === 'super_admin') {
                                                return item.title === 'Super Admin';
                                            } else {
                                                return item.title !== 'Super Admin';
                                            }
                                        })
                                        .filter(item => {
                                            // plan free hide library and analytics
                                             if (dataClient.length > 0 && dataClient[0].plan === "Free") {
                                                if (["Library", "Analytics"].includes(item.title)) {
                                                    return false;
                                                }
                                            }

                                            if (role === 'super_admin') {
                                                return true;
                                            }
                                            return role === 'admin' || allowedUrls.includes(`/${isDomain}${item.url}`);
                                        })
                                        .map(item => (
                                        <SidebarMenuItem key={item.title} className="w-full flex justify-center">
                                            <SidebarMenuButton
                                                isActive={isActive(item.url)}
                                                asChild
                                                tooltip={state === "collapsed" ? t(item.title) : undefined}
                                                className={`
                                                    w-full justify-start transition-all duration-200 font-khmer 
                                                    !bg-transparent hover:!bg-transparent active:!bg-transparent data-[active=true]:!bg-transparent
                                                    ${isActive(item.url) ? 'text-red-500 font-medium' : 'text-sidebar-foreground hover:text-red-500'}
                                                    ${state === "collapsed" ? "h-16 w-16 p-0 justify-center mx-auto my-1 flex items-center" : "px-3 py-2.5"}
                                                `}
                                            >
                                            <Link
                                                to={role === 'super_admin' ? item.url : `/${isDomain}${item.url}`}
                                                className={`flex items-center ${state === "collapsed" ? "justify-center w-full h-full" : "w-full"}`}
                                            >
                                            <item.icon className={`${state === "collapsed" ? "h-10 w-10" : "h-5 w-5 mr-3"} transition-all duration-300 flex-shrink-0 ${isActive(item.url) ? 'text-red-500' : 'text-white dark:text-black'}`} />
                                                {state === "expanded" && (
                                                    <span className={`block transition-all duration-300 font-medium truncate ${
                                                    isActive(item.url) ? 'text-red-500' : 'text-white dark:text-black'
                                                    } ${i18n.language === 'kh' ? 'text-[16px]' : ''}`}>
                                                    {t(item.title)}
                                                    </span>
                                                )}
                                            </Link>

                                            </SidebarMenuButton>
                                        </SidebarMenuItem>
                                        ))}
                                    </SidebarMenu>
                                </SidebarMenu>
                            </SidebarGroupContent>
                        </SidebarGroup>
                    </SidebarContent>

                    <SidebarFooter className="border-t border-[#f9f9f914] dark:border-sidebar-border bg-[#051438] dark:bg-sidebar p-4 ">
                        <div className="flex flex-col items-center space-y-2">
                            <a 
                                href="https://t.me/Mangrove_Studio" 
                                target="_blank" 
                                rel="noopener noreferrer"
                                className={`text-xs text-sidebar-foreground/60 transition-opacity duration-200 cursor-pointer ${
                                    state === "collapsed" ? "opacity-0 hidden" : "opacity-100"
                                } text-white dark:text-black`}
                            >
                                Ask Support
                            </a>
                            <div className={`text-xs text-sidebar-foreground/40 transition-opacity duration-200 ${state === "collapsed" ? "opacity-0 hidden" : "opacity-100"} text-white dark:text-black`}>
                                {/* v2.1.0 */}
                            </div>
                        </div>
                    </SidebarFooter>
                </SidebarComponent>
            </div>
         
        </main>
    );
};


export default Sidebar;
