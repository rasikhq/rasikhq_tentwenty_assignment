import { Text as NativeText, type TextProps as NativeTextProps } from 'react-native';

// Variants are added as screens need them
const variants = {
  title: 'font-poppins-medium text-base text-ink',
};

type TextProps = Omit<NativeTextProps, 'className'> & {
  variant: keyof typeof variants;
};

/** App text: callers pick a variant instead of passing class strings. */
export function Text({ variant, ...props }: TextProps) {
  return <NativeText className={variants[variant]} {...props} />;
}
