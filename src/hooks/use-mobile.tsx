
import * as React from "react"

// Device breakpoints
export const BREAKPOINTS = {
  MOBILE: 640, // Small mobile devices
  TABLET: 768, // Tablets and large mobiles
  LAPTOP: 1024, // Small laptops
  DESKTOP: 1280, // Desktops and large laptops
}

/**
 * Hook to detect if the device is a mobile or tablet
 * @returns Object with boolean flags for different device types
 */
export function useDeviceBreakpoints() {
  const [breakpoints, setBreakpoints] = React.useState({
    isMobile: false,
    isTablet: false,
    isLaptop: false,
    isDesktop: false,
    isInitialized: false,
  });

  React.useEffect(() => {
    // Function to check the device type
    const checkBreakpoints = () => {
      const width = window.innerWidth;
      
      setBreakpoints({
        isMobile: width < BREAKPOINTS.MOBILE,
        isTablet: width >= BREAKPOINTS.MOBILE && width < BREAKPOINTS.TABLET,
        isLaptop: width >= BREAKPOINTS.TABLET && width < BREAKPOINTS.DESKTOP,
        isDesktop: width >= BREAKPOINTS.DESKTOP,
        isInitialized: true,
      });
    };
    
    // Initial check
    checkBreakpoints();
    
    // Add event listener for resize
    window.addEventListener('resize', checkBreakpoints);
    
    // Clean up
    return () => window.removeEventListener('resize', checkBreakpoints);
  }, []);

  return breakpoints;
}

// Legacy hook for backward compatibility
export function useIsMobile() {
  const [isMobile, setIsMobile] = React.useState<boolean>(false);
  const [isInitialized, setIsInitialized] = React.useState(false);

  React.useEffect(() => {
    // Function to check if the device is mobile
    const checkMobile = () => {
      const isMobileDevice = window.innerWidth < BREAKPOINTS.TABLET;
      setIsMobile(isMobileDevice);
      if (!isInitialized) {
        setIsInitialized(true);
      }
    };
    
    // Initial check
    checkMobile();
    
    // Add event listener for resize
    window.addEventListener('resize', checkMobile);
    
    // Clean up
    return () => window.removeEventListener('resize', checkMobile);
  }, [isInitialized]);

  // Return true for mobile, false for desktop
  return isMobile;
}
