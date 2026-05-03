module.exports = function (api) {
    api.cache(true);
    return {
        presets: [['babel-preset-expo', { unstable_transformImportMeta: true }]],
        overrides: [
            {
                test: /[\\/]node_modules[\\/](yargs|jiti|object-inspect|expo-sqlite)[\\/]/,
                presets: [['babel-preset-expo', { unstable_transformImportMeta: true }]],
                plugins: ['@babel/plugin-transform-export-namespace-from']
            },
        ],
    };
};
