import { useLocation } from "react-router-dom";
import { useAuth } from "@/contexts/AuthProvider";
import { Navigate } from "react-router-dom";
import NavigationHeader from "./NavigationHeader";
import Sidebar from "./Sidebar";
import { SidebarProvider } from "@/components/ui/sidebar";
import { useDeviceBreakpoints } from "@/hooks/use-mobile";
import BillingGuard from "./BillingGuard";

interface LayoutProps {
  children: React.ReactNode;
  requireAuth?: boolean;
}

const Layout = ({ children, requireAuth = true }: LayoutProps) => {
  const { isAuthenticated, isLoading } = useAuth();
  const location = useLocation();
  const { isMobile, isTablet } = useDeviceBreakpoints();
  
  const currentPath = location.pathname;

  // If authentication is required and user is not authenticated, redirect to auth page
  if (requireAuth && !isLoading && !isAuthenticated) {
    return <Navigate to="/auth" replace />;
  }

  return (
    <BillingGuard>
      <SidebarProvider>
        <div className="min-h-screen-safe flex w-full bg-background overflow-x-hidden">
          {/* Sidebar - hidden on mobile, overlay on tablet */}
          <div className={`${isMobile ? 'hidden' : ''} ${isTablet ? 'fixed inset-y-0 left-0 z-50' : ''}`}>
            <Sidebar currentPath={currentPath} />
          </div>
          
          {/* Main content area */}
          <div className={`flex flex-col flex-1 min-w-0 ${isTablet && !isMobile ? 'ml-0' : ''}`}>
            <NavigationHeader currentPath={currentPath} />
            
            {/* Main content with responsive padding */}
            <main className="flex-1 overflow-auto w-full">
              <div className="w-full max-w-[1600px] mx-auto px-2 py-2 sm:px-4 sm:py-4 md:px-6 md:py-5 lg:px-8 lg:py-6">
                {children}
              </div>
            </main>
            
            {/* Footer with responsive text and padding */}
            <footer className="border-t py-2 px-2 sm:py-3 sm:px-4 md:px-6 text-center text-xs sm:text-sm text-muted-foreground w-full">
              <p className="break-words">
                Made with <span className="text-red-500">❤️</span> by{" "}
                <a 
                  href="https://mangrovestudio.net/" 
                  target="_blank" 
                  rel="noopener noreferrer" 
                  className="text-primary hover:underline"
                >
                  Mangrove Studio Co Ltd
                </a>
              </p>
            </footer>
          </div>
          
          {/* Mobile overlay for tablet sidebar */}
          {isTablet && !isMobile && (
            <div className="fixed inset-0 bg-black/20 z-40 md:hidden" />
          )}
        </div>
      </SidebarProvider>
    </BillingGuard>
  );
};

export default Layout;
