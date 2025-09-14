import { useState } from "react";
import { Menu, Bell } from "lucide-react";
import { Link } from "react-router-dom";
import { ProfileMenu } from "./ProfileMenu";
import { ThemeToggle } from "./ThemeToggle";
import { LanguageToggle } from "./LanguageToggle";
import { useIsMobile } from "@/hooks/use-mobile";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { showInfo } from "@/services/notification";
import { useLanguage } from "@/contexts/LanguageContext";
import { Contact, CircleDollarSign, DollarSign, CheckSquare, Package, FolderOpen, GitBranch, StickyNote, Library, MessageSquare, Settings } from "lucide-react";
import { useNotification } from "@/hooks/useNotification";
import { User } from "@/tokens/token";
import { useTranslation } from 'react-i18next';

const NavigationHeader = ({ currentPath }: { currentPath: string; }) => {

    const { notifications, unreadCount, setHasUnread, handleMarkAllAsRead } = useNotification();
    const isMobile = useIsMobile();
    const { t } = useLanguage();
    const { domain } = User();

    const handleNotificationClick = () => {
        showInfo({
            title: t('notifications.title'),
            description: t('notifications.no_new'),
            duration: 3000
        });
    };

    return <header className="border-b bg-background z-10 w-full sticky top-0 left-0">
        <div className="w-full flex h-14 items-center justify-between px-3 sm:px-4 max-w-full">
            {/* Left side - Mobile Menu + Logo */}
            <div className="flex items-center gap-3">
            {/* Mobile Navigation */}
                <div className="flex md:hidden">
                    <Sheet>
                        <SheetTrigger asChild>
                            <button className="p-2 -ml-2 rounded-md hover:bg-secondary">
                            <Menu className="h-5 w-5" />
                            </button>
                        </SheetTrigger>
                        <SheetContent side="left" className="w-[280px] py-6 px-4">
                            <div className="flex flex-col gap-6">
                                {/* Mobile Logo */}
                                <div className="flex justify-center mb-6">
                                    <Link to={`/${domain}/pipelines/deals`} className="flex items-center">
                                        <div className="h-8 w-auto">
                                            <img alt="SellMeApp" src="/sellmeapp-uploads/logo-black.png" className={`h-full w-auto object-contain max-w-full dark:hidden "h-6 w-6" : "h-8 w-auto"}`}/>
                                            <img alt="SellMeApp" src="/sellmeapp-uploads/logo-white.png" className={`h-full w-auto object-contain max-w-full hidden dark:block "h-6 w-6" : "h-8 w-auto"}`}/>
                                        </div>
                                    </Link>
                                </div>
                                
                                {/* Mobile Navigation Items */}
                                <nav className="flex flex-col space-y-2">
                                    <MobileNavItems currentPath={currentPath} />
                                </nav>
                            </div>
                        </SheetContent>
                    </Sheet>
                </div>

                {/* Mobile Logo - visible on mobile, aligned left */}
                {/* <div className="flex md:hidden items-center">
                    <Link to="/pipelines/deals" className="flex items-center">
                    <div className="h-5 w-auto">
                        <img src="/lovable-uploads/99fa357b-8419-4db8-99b6-f9788dea326d.png" alt="Mangrove Studio" className="h-full w-auto object-contain" />
                    </div>
                    </Link>
                </div> */}

                {/* Desktop Logo - only visible on larger screens */}
                <div className="hidden md:flex items-center">
                    <Link to="/pipelines/deals" className="flex items-center">
                    <div className="h-6 w-auto"></div>
                    </Link>
                </div>
            </div>
            
            {/* Right side with actions */}
            <div className="flex items-center gap-1 sm:gap-2">
            {/* Language Toggle */}
            {/* <LanguageToggle /> */}
            
            {/* Theme Toggle */}
            <ThemeToggle />
            
            {/* Notification Button */}
            <Popover>
                <PopoverTrigger asChild>
                    <Button variant="ghost" size="icon" className="relative">
                        <Bell className="h-5 w-5" />
                        {unreadCount > 0 && (
                           <div className="absolute top-1 right-1 bg-[#FB5557] text-white text-[10px] font-bold h-[16px] min-w-[16px] px-[4px] rounded-full flex items-center justify-center">
                                {unreadCount > 9 ? "9+" : unreadCount}
                            </div>
                        )}
                    </Button>
                </PopoverTrigger>
                <PopoverContent align="end" className="w-80 p-4">
                    <div className="flex flex-col space-y-2">
                        <h4 className="font-medium">Notifications</h4>
                        {notifications.length === 0 ? (
                            <p className="text-sm text-muted-foreground">You have no new notifications</p>
                        ) : (
                            <div className="space-y-2 max-h-60 overflow-y-auto">
                                {notifications.map((note) => (
                                <div key={note.id} className="text-sm border p-2 rounded bg-muted">
                                    {note.message}
                                    <div className="text-xs text-muted-foreground my-1"> 
                                        {new Date(note.createdAt).toLocaleString()}
                                    </div>
                                </div>
                                ))}
                            </div>
                        )}
                        <div className="flex justify-end">
                             <Button variant="outline" size="sm" onClick={() => handleMarkAllAsRead() }>
                                Mark all as read
                            </Button>
                        </div>
                    </div>
                </PopoverContent>

            </Popover>
            
            {/* Profile Menu */}
            <ProfileMenu />
            </div>
        </div>
        </header>;
    };

    const MobileNavItems = ({ currentPath }: { currentPath: string }) => {
        const { t, i18n } = useTranslation();
        const { domain } = User();

        const navItems = [
            { path: `/${domain}/pipelines`, label: t("menu.pipeline"), icon: GitBranch },
            // { path: `/${domain}/pipelines/deals`, label: t("menu.deals"), icon: FolderOpen },
            { path: `/${domain}/pipelines/contacts`, label: t("Contacts"), icon: Contact },
            { path: `/${domain}/pipelines/tasks`, label: t("Tasks"), icon: CheckSquare },
            { path: `/${domain}/pipelines/products`, label: t("Products"), icon: Package },
            { path: `/${domain}/pipelines/notes`, label: t("Notes"), icon: StickyNote },
            // { path: `/${domain}/library`, label: t("Library"), icon: Library },
            // { path: `/${domain}/pipelines/sales`, label: t("Analytics"), icon: DollarSign },
            { path: `/${domain}/admin`, label: t("Admin"), icon: Settings },
        ];

        const isActive = (path: string) => currentPath === path;

        return (
            <>
                {navItems.map((item) => (
                    <Link key={item.path} to={item.path}
                        className={`
                            flex items-center px-3 py-2 rounded-lg transition-all duration-200
                            ${isActive(item.path)
                                ? "bg-red-500 text-white font-medium shadow-md"
                                : "hover:bg-secondary text-foreground hover:text-red-500"
                            }
                        `}
                    >
                        <item.icon
                            className={`h-5 w-5 mr-3 transition-all duration-300 flex-shrink-0
                            ${isActive(item.path) ? "text-white" : "text-sidebar-foreground dark:text-white"}`}
                        />
                        <span className={`font-medium truncate ${i18n.language === "kh" ? "text-[16px]" : ""}`}>
                            {item.label}
                        </span>
                    </Link>
                ))}
            </>
        );
    };

export default NavigationHeader;