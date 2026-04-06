import React, { createContext, useContext } from 'react';

const NetworkContext = createContext();

export const useNetwork = () => useContext(NetworkContext);

export const NetworkProvider = ({ children }) => {
    // STUB VERSION - Just provides default "online" status
    // This prevents crashes from ConnectionLostScreen trying to use theme before it's ready
    const value = {
        isConnected: true,
        isInternetReachable: true,
    };

    return <NetworkContext.Provider value={value}>{children}</NetworkContext.Provider>;
};
