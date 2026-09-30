import { Linking } from 'react-native';

/**
 * Hands a link to the phone, which opens it in the app that owns it, such as YouTube, or else in the
 * browser. On a phone with neither, nothing happens.
 */
export function openLink(url: string) {
  Linking.openURL(url).catch(() => {});
}
