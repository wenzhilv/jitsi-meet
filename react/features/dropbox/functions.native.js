// @flow

import { NativeModules } from 'react-native';

const { Dropbox } = NativeModules;

/**
 * Returns the display name for the current dropbox account.
 *
 * @param {string} token - The dropbox access token.
 * @returns {Promise<string>}
 */
export function getDisplayName(token: string) {
    return Dropbox.getDisplayName(token);
}

/**
 * Returns information about the space usage for the current dropbox account.
 *
 * @param {string} token - The dropbox access token.
 * @returns {Promise<Object>}
 */
export function getSpaceUsage(token: string) {
    return Dropbox.getSpaceUsage(token);
}


/**
 * Action to authorize the Jitsi Recording app in dropbox.
 *
 * @param {string} clientId - The Jitsi Recorder dropbox app ID.
 * @param {string} redirectURI - The return URL.
 * @returns {Promise<string>}
 */
export function _authorizeDropbox(): Promise<string> {
    return Dropbox.authorize();
}
