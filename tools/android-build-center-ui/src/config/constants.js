/**
 * NStep Build Center - Constants & Enums
 */

const CREDENTIAL_STATES = {
    READY: 'ready',
    FOUND_UNVALIDATED: 'found_unvalidated',
    KEYSTORE_FOUND_PASSWORD_MISSING: 'keystore_found_password_missing',
    PASSWORD_FOUND_KEYSTORE_MISSING: 'password_found_keystore_missing',
    MISSING: 'missing',
    INVALID: 'invalid',
    PRODUCTION_PROTECTED: 'production_protected'
};

const APP_CLASSIFICATIONS = {
    PRIVATE: 'private',
    PRODUCTION: 'production',
    PRIVATE_ASSUMED: 'private_assumed',
    UNKNOWN: 'unknown'
};

const BUILD_STATES = {
    IDLE: 'idle',
    RUNNING: 'running',
    SUCCESS: 'success',
    FAILED: 'failed',
    CANCELLED: 'cancelled',
    FAILED_PRECHECK: 'failed_precheck'
};

module.exports = {
    CREDENTIAL_STATES,
    APP_CLASSIFICATIONS,
    BUILD_STATES
};
