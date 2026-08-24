import appConfig from '../../app.json';

const { expo } = appConfig;

export const APP_NAME = expo.name;
export const APP_VERSION = expo.version;
export const APP_BUILD = expo.ios.buildNumber;
export const APP_VERSION_LABEL = `${APP_NAME} v${APP_VERSION} (Build ${APP_BUILD})`;
export const MOBILE_BUILD_ID = `mob-v${APP_VERSION}+${APP_BUILD}`;
export const MOBILE_PROVENANCE_BUILD_ID = `mob-v${APP_VERSION} (${APP_BUILD})`;
