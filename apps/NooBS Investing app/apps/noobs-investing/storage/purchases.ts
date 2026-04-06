import { Platform } from 'react-native';

// Use a conditional require to avoid bundling issues on web
let Purchases: any;

if (Platform.OS === 'web') {
    Purchases = {
        configure: (config: any) => console.log('Purchases: Web Mock Configured', config),
        getCustomerInfo: async () => ({ entitlements: { active: {} } }),
        getOfferings: async () => ({ current: null }),
        purchasePackage: async (pkg: any) => {
            console.log('Purchases: Web Mock Purchase', pkg);
            return { customerInfo: { entitlements: { active: { 'pro': true } } } };
        },
        restorePurchases: async () => ({ entitlements: { active: {} } }),
    };
} else {
    try {
        // We use require instead of import to delay the resolution until runtime
        Purchases = require('react-native-purchases').default;
    } catch (e) {
        console.warn('Purchases module not found, using mobile mock.');
        Purchases = {
            configure: () => { },
            getCustomerInfo: async () => ({ entitlements: { active: {} } }),
            getOfferings: async () => ({ current: null }),
            purchasePackage: async () => ({ customerInfo: { entitlements: { active: {} } } }),
            restorePurchases: async () => ({ entitlements: { active: {} } }),
        };
    }
}

export default Purchases;
