export default {
    configure: (config: any) => {
        console.log('Purchases: Web Mock Configured', config);
    },
    getCustomerInfo: async () => ({
        entitlements: { active: {} }
    }),
    getOfferings: async () => ({
        current: null
    }),
    purchasePackage: async (pkg: any) => {
        console.log('Purchases: Web Mock Purchase', pkg);
        return { customerInfo: { entitlements: { active: { 'pro': true } } } };
    },
    restorePurchases: async () => ({
        entitlements: { active: {} }
    })
};
