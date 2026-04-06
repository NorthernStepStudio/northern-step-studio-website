import { Share, Platform } from 'react-native';

const APP_STORE_LINK = 'https://northernstepstudio.com';
const DEEP_LINK_SCHEME = 'nexusbuild://';

/**
 * Share content natively with deep links
 * @param {object} options
 * @param {string} options.title - Title for the share dialog
 * @param {string} options.message - Main message text
 * @param {string} options.type - 'build', 'part', 'user', 'app'
 * @param {string|number} options.id - Component/Build ID
 */
export const shareContent = async ({ title, message, type = 'app', id = '' }) => {
    try {
        // Construct deep link
        // e.g. nexusbuild://build/123
        const deepLink = `${DEEP_LINK_SCHEME}${type}${id ? '/' + id : ''}`;

        // Construct full message
        // iOS: url param handles the link nicely
        // Android: link must be in the message
        const fullMessage = `${message}\n\nCheck it out: ${deepLink}\n\nDownload NexusBuild: ${APP_STORE_LINK}`;

        const shareOptions = Platform.select({
            ios: {
                message: message + '\n\n' + APP_STORE_LINK, // iOS shows URL preview separately often
                url: deepLink,
                subject: title
            },
            default: {
                message: fullMessage,
                title: title
            }
        });

        const result = await Share.share(shareOptions);

        if (result.action === Share.sharedAction) {
            if (result.activityType) {
                // shared with activity type of result.activityType
                return { success: true, method: result.activityType };
            } else {
                // shared
                return { success: true };
            }
        } else if (result.action === Share.dismissedAction) {
            return { success: false, dismissed: true };
        }
    } catch (error) {
        console.error('Share Error:', error);
        return { success: false, error };
    }
};
