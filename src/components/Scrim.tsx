import { LinearGradient } from 'expo-linear-gradient';
import { StyleSheet } from 'react-native';

// Clear at the top to dark at the bottom
const colors = ['rgba(0, 0, 0, 0)', 'rgba(0, 0, 0, 0.8)'] as const;

/** A darkening gradient over the image behind it, so the title on top stays readable on a bright backdrop. */
export function Scrim() {
  return <LinearGradient colors={colors} style={StyleSheet.absoluteFill} />;
}
