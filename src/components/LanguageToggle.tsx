
import { Globe } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useLanguage } from "@/contexts/LanguageContext";
import { useDeviceBreakpoints } from "@/hooks/use-mobile";

export function LanguageToggle() {
    const { language, setLanguage, t } = useLanguage();
    const { isMobile } = useDeviceBreakpoints();

    return (
        <DropdownMenu>
            <DropdownMenuTrigger asChild>
                <Button 
                    variant="outline" 
                    size={isMobile ? "sm" : "sm"}
                    className="relative h-8 sm:h-9 px-2 sm:px-3 bg-background border-2 hover:bg-accent hover:text-accent-foreground focus:ring-2 focus:ring-primary focus:ring-offset-2 transition-all duration-200"
                >
                    <Globe className="h-3 w-3 sm:h-4 sm:w-4 mr-1 sm:mr-2" />
                    <span className="font-medium text-xs sm:text-sm">
                    {language === 'en' ? 'EN' : 'ខ្មែរ'}
                    </span>
                    <span className="sr-only">{t('language.toggle')}</span>
                </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="min-w-[100px] sm:min-w-[120px] z-50">
                <DropdownMenuItem 
                    onClick={() => setLanguage("en")} 
                    className={`cursor-pointer px-2 sm:px-3 py-1.5 sm:py-2 text-xs sm:text-sm ${language === 'en' ? 'bg-primary text-primary-foreground font-medium' : 'hover:bg-accent'}`}
                >
                    {t('language.english')}
                </DropdownMenuItem>
                <DropdownMenuItem 
                    onClick={() => setLanguage("kh")} 
                    className={`cursor-pointer px-2 sm:px-3 py-1.5 sm:py-2 text-xs sm:text-sm ${language === 'km' ? 'bg-primary text-primary-foreground font-medium' : 'hover:bg-accent'}`}
                >
                    {t('language.khmer')}
                </DropdownMenuItem>
            </DropdownMenuContent>
        </DropdownMenu>
    );
}
