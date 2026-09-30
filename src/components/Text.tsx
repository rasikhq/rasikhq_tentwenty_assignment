import { Text as NativeText, type TextProps as NativeTextProps } from 'react-native';

// Variants are added as screens need them
const variants = {
  title: 'font-poppins-medium text-base text-ink',
  // Under a header bar's title. Grey, where the Figma's sky blue would be too faint to read on white.
  headerDetail: 'font-poppins-medium text-xs text-grey',
  cardTitle: 'font-poppins-medium text-lg text-white',
  tileTitle: 'font-poppins-medium text-base text-white',
  heroTitle: 'font-poppins-semibold text-xl text-white',
  heroSubtitle: 'font-poppins text-sm text-white',
  body: 'font-poppins text-sm text-ink',
  sectionTitle: 'font-poppins-medium text-xs text-ink',
  rowTitle: 'font-poppins-medium text-base text-ink',
  rowDetail: 'font-poppins-medium text-xs text-grey',
  chipOnLight: 'font-poppins-medium text-xs text-ink',
  chipOnDark: 'font-poppins-medium text-xs text-white',
  stateTitle: 'text-center font-poppins-semibold text-lg text-ink',
  stateMessage: 'text-center font-poppins text-sm text-ink',
  stateTitleOnDark: 'text-center font-poppins-semibold text-lg text-white',
  stateMessageOnDark: 'text-center font-poppins text-sm text-white',
  banner: 'text-center font-poppins text-xs text-white',
  // The seat map's small print: a row's number, and the word under the screen's arc
  hallLabel: 'font-poppins-medium text-2xs text-grey',
  legend: 'font-poppins-medium text-xs text-grey',
  totalLabel: 'font-poppins text-2xs text-ink',
  total: 'font-poppins-semibold text-base text-ink',
  toast: 'text-center font-poppins-medium text-xs text-white',
  // Ink on sky blue reads clearly, where the white text of some Figma buttons would not
  button: 'font-poppins-medium text-sm text-ink',
  buttonOnDark: 'font-poppins-medium text-sm text-white',
};

type TextProps = Omit<NativeTextProps, 'className'> & {
  variant: keyof typeof variants;
};

/** App text: callers pick a variant instead of passing class strings. */
export function Text({ variant, ...props }: TextProps) {
  return <NativeText className={variants[variant]} {...props} />;
}
