
import { Link, useLocation } from "react-router-dom";
import { Contact, CircleDollarSign, DollarSign, CheckSquare, Package, FolderOpen, Settings, StickyNote, Library } from "lucide-react";
import { NavigationMenu, NavigationMenuContent, NavigationMenuItem, NavigationMenuLink, NavigationMenuList, NavigationMenuTrigger, navigationMenuTriggerStyle } from "@/components/ui/navigation-menu";
import { cn } from "@/lib/utils";

const TopNavigationMenu = () => {
  const location = useLocation();

  const isActive = (path: string) => {
    if (path === "/pipelines/deals") {
      return location.pathname === "/pipelines/deals" || location.pathname === "/pipelines";
    }
    return location.pathname === path;
  };

  return (
    <NavigationMenu className="max-w-full w-full justify-start">
      <NavigationMenuList className="gap-1 px-2 w-full">
        <NavigationMenuItem>
          <Link 
            to="/pipelines/deals"
            className={cn(
              navigationMenuTriggerStyle(),
              "transition-all duration-200 hover:bg-gradient-to-r hover:from-red-500 hover:to-orange-500 hover:text-white hover:shadow-lg hover:scale-105",
              isActive("/pipelines/deals") 
                ? "bg-gradient-to-r from-red-500 to-orange-500 text-white shadow-lg font-medium" 
                : "hover:from-red-50 hover:to-orange-50"
            )}
          >
            <FolderOpen className="mr-2 h-5 w-5" />
            <span>Deals</span>
          </Link>
        </NavigationMenuItem>
        
        <NavigationMenuItem>
          <Link 
            to="/pipelines"
            className={cn(
              navigationMenuTriggerStyle(),
              "transition-all duration-200 hover:bg-gradient-to-r hover:from-red-500 hover:to-orange-500 hover:text-white hover:shadow-lg hover:scale-105",
              location.pathname === "/pipelines" 
                ? "bg-gradient-to-r from-red-500 to-orange-500 text-white shadow-lg font-medium" 
                : "hover:from-red-50 hover:to-orange-50"
            )}
          >
            <Settings className="mr-2 h-5 w-5" />
            <span>Pipeline</span>
          </Link>
        </NavigationMenuItem>
        
        <NavigationMenuItem>
          <Link 
            to="/pipelines/tasks"
            className={cn(
              navigationMenuTriggerStyle(),
              "transition-all duration-200 hover:bg-gradient-to-r hover:from-red-500 hover:to-orange-500 hover:text-white hover:shadow-lg hover:scale-105",
              isActive("/pipelines/tasks") 
                ? "bg-gradient-to-r from-red-500 to-orange-500 text-white shadow-lg font-medium" 
                : "hover:from-red-50 hover:to-orange-50"
            )}
          >
            <CheckSquare className="mr-2 h-5 w-5" />
            <span>Tasks</span>
          </Link>
        </NavigationMenuItem>
        
        <NavigationMenuItem>
          <Link 
            to="/pipelines/contacts"
            className={cn(
              navigationMenuTriggerStyle(),
              "transition-all duration-200 hover:bg-gradient-to-r hover:from-red-500 hover:to-orange-500 hover:text-white hover:shadow-lg hover:scale-105",
              isActive("/pipelines/contacts") 
                ? "bg-gradient-to-r from-red-500 to-orange-500 text-white shadow-lg font-medium" 
                : "hover:from-red-50 hover:to-orange-50"
            )}
          >
            <Contact className="mr-2 h-5 w-5" />
            <span>Contacts</span>
          </Link>
        </NavigationMenuItem>
        
        <NavigationMenuItem>
          <Link 
            to="/pipelines/products"
            className={cn(
              navigationMenuTriggerStyle(),
              "transition-all duration-200 hover:bg-gradient-to-r hover:from-red-500 hover:to-orange-500 hover:text-white hover:shadow-lg hover:scale-105",
              isActive("/pipelines/products") 
                ? "bg-gradient-to-r from-red-500 to-orange-500 text-white shadow-lg font-medium" 
                : "hover:from-red-50 hover:to-orange-50"
            )}
          >
            <Package className="mr-2 h-5 w-5" />
            <span>Products</span>
          </Link>
        </NavigationMenuItem>
        
        <NavigationMenuItem>
          <Link 
            to="/pipelines/notes"
            className={cn(
              navigationMenuTriggerStyle(),
              "transition-all duration-200 hover:bg-gradient-to-r hover:from-red-500 hover:to-orange-500 hover:text-white hover:shadow-lg hover:scale-105",
              isActive("/pipelines/notes") 
                ? "bg-gradient-to-r from-red-500 to-orange-500 text-white shadow-lg font-medium" 
                : "hover:from-red-50 hover:to-orange-50"
            )}
          >
            <StickyNote className="mr-2 h-5 w-5" />
            <span>Notes</span>
          </Link>
        </NavigationMenuItem>
        
        <NavigationMenuItem>
          <Link 
            to="/library"
            className={cn(
              navigationMenuTriggerStyle(),
              "transition-all duration-200 hover:bg-gradient-to-r hover:from-red-500 hover:to-orange-500 hover:text-white hover:shadow-lg hover:scale-105",
              isActive("/library") 
                ? "bg-gradient-to-r from-red-500 to-orange-500 text-white shadow-lg font-medium" 
                : "hover:from-red-50 hover:to-orange-50"
            )}
          >
            <Library className="mr-2 h-5 w-5" />
            <span>Library</span>
          </Link>
        </NavigationMenuItem>

        <NavigationMenuItem>
          <Link 
            to="/pipelines/sales"
            className={cn(
              navigationMenuTriggerStyle(),
              "transition-all duration-200 hover:bg-gradient-to-r hover:from-red-500 hover:to-orange-500 hover:text-white hover:shadow-lg hover:scale-105",
              isActive("/pipelines/sales") 
                ? "bg-gradient-to-r from-red-500 to-orange-500 text-white shadow-lg font-medium" 
                : "hover:from-red-50 hover:to-orange-50"
            )}
          >
            <DollarSign className="mr-2 h-5 w-5" />
            <span>Analytics</span>
          </Link>
        </NavigationMenuItem>
      </NavigationMenuList>
    </NavigationMenu>
  );
};

export default TopNavigationMenu;
