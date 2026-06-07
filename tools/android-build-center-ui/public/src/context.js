export const context = {
    elements: {},
    selectedBuildByApp: new Map(),
    logViewMode: 'history',
    uploadKeyResetArmedFor: null,
    logOptions: { autoScroll: true, showRaw: false }
};

export const PASSWORD_LABEL_PREFIX = '**********';

export function isStoredPasswordLabel(value) {
    return String(value || '').startsWith(PASSWORD_LABEL_PREFIX);
}
