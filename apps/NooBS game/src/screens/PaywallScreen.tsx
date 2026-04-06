import React from "react";

export function PaywallScreen({
    onUnlock,
    onNotNow,
    onExit
}: {
    onUnlock: () => void;
    onNotNow: () => void;
    onExit: () => void;
}) {
    // Instant bypass so the rest of the simulation can run without interruption.
    React.useEffect(() => {
        onUnlock();
    }, [onUnlock]);

    return null;
}
