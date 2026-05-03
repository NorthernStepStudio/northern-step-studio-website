const createExpoWebpackConfigAsync = require('@expo/webpack-config');

module.exports = async function (env, argv) {
    const config = await createExpoWebpackConfigAsync(env, argv);

    config.resolve = config.resolve || {};
    config.resolve.alias = {
        ...(config.resolve.alias || {}),
        'zustand/middleware': require.resolve('zustand/middleware.js'),
    };

    config.resolve.extensions = [
        ...(config.resolve.extensions || []),
        '.wasm',
    ];

    config.experiments = {
        ...(config.experiments || {}),
        asyncWebAssembly: true,
    };

    config.module = config.module || {};
    config.module.rules = config.module.rules || [];
    config.module.rules.push({
        test: /\.wasm$/,
        type: 'asset/resource',
    });

    return config;
};
