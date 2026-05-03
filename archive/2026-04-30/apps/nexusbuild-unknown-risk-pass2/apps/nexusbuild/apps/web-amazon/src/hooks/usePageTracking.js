import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';

/**
 * 📊 usePageTracking Hook (Amazon-Compliant Site)
 * 
 * In a Single Page Application (SPA), standard Google Analytics site tags
 * only fire on initial load. This hook ensures that every navigation
 * within the React Router is tracked as a new pageview.
 */
const usePageTracking = () => {
    const location = useLocation();

    useEffect(() => {
        // Only track if gtag is defined (prevent errors in dev/testing)
        if (typeof window.gtag === 'function') {
            const GA_ID = import.meta.env.VITE_GA_ID;
            
            if (GA_ID) {
                window.gtag('config', GA_ID, {
                    page_path: location.pathname + location.search,
                    page_location: window.location.href
                });
                
                // Optional: Log for debugging in dev environment
                if (import.meta.env.DEV) {
                    console.log(`[Analytics] Tracked pageview: ${location.pathname}`);
                }
            }
        }
    }, [location]);
};

export default usePageTracking;
