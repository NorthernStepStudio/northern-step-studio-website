import { useRef } from 'react';
import { useRouter } from 'expo-router';
import { InteractionManager } from 'react-native';
import { ScreenHandle } from '../components/Screen';

/**
 * Custom hook to handle high-velocity "Whoosh" transitions.
 * Coordinates the Screen's exit animation with navigation using InteractionManager.
 */
export function useVelocityNavigate() {
    const router = useRouter();
    const screenRef = useRef<ScreenHandle>(null);

    const navigate = (pathOrOptions: string | { pathname: string; params?: Record<string, any> }, params?: Record<string, any>) => {
        if (screenRef.current) {
            const path = typeof pathOrOptions === 'string' ? pathOrOptions : pathOrOptions.pathname;
            const finalParams = typeof pathOrOptions === 'string' ? params : pathOrOptions.params;

            console.log("[VelocityFlow] Triggering exit animation for:", path);

            // Trigger the visceral exit animation (Whoosh + Fade + Scale)
            screenRef.current.exitAnimation(() => {
                // Use InteractionManager to ensure animation completes
                // before navigation starts
                InteractionManager.runAfterInteractions(() => {
                    console.log("[VelocityFlow] Animation complete, navigating to:", path);
                    try {
                        if (finalParams) {
                            router.push({ pathname: path as any, params: finalParams });
                        } else {
                            router.push(path as any);
                        }
                    } catch (error) {
                        console.error("[VelocityFlow] Navigation error:", error);
                        // Fallback to direct navigation if something fails
                        router.push(path as any);
                    }
                });
            });
        } else {
            console.warn("[VelocityFlow] No screenRef attached, using fallback navigation");
            // Fallback if ref isn't attached
            const path = typeof pathOrOptions === 'string' ? pathOrOptions : pathOrOptions.pathname;
            const finalParams = typeof pathOrOptions === 'string' ? params : pathOrOptions.params;
            if (finalParams) {
                router.push({ pathname: path as any, params: finalParams });
            } else {
                router.push(path as any);
            }
        }
    };

    return {
        screenRef,
        navigate
    };
}
