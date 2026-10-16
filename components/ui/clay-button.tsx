'use client';
import { motion, type HTMLMotionProps } from 'motion/react';
import { forwardRef } from 'react';

const VARIANTS = {
  primary: 'bg-coral text-white shadow-[0_6px_0_var(--color-coral-dark)]',
  secondary: 'bg-lavender text-white shadow-[0_6px_0_var(--color-lavender-dark)]',
  mint: 'bg-mint-dark text-white shadow-[0_6px_0_#16653f]',
  ghost: 'bg-white text-ink shadow-[0_6px_0_#e3e6ff]',
} as const;
const SIZES = { md: 'px-5 py-3 text-base', lg: 'px-7 py-4 text-lg' } as const;

type Props = HTMLMotionProps<'button'> & { variant?: keyof typeof VARIANTS; size?: keyof typeof SIZES };

export const ClayButton = forwardRef<HTMLButtonElement, Props>(function ClayButton(
  { variant = 'primary', size = 'md', className = '', disabled, ...rest }, ref,
) {
  return (
    <motion.button
      ref={ref}
      disabled={disabled}
      whileHover={disabled ? undefined : { y: -2 }}
      whileTap={disabled ? undefined : { y: 4, boxShadow: '0 2px 0 rgba(0,0,0,0.12)' }}
      className={`rounded-2xl font-display font-extrabold tracking-wide transition-colors disabled:cursor-not-allowed disabled:opacity-50 ${VARIANTS[variant]} ${SIZES[size]} ${className}`}
      {...rest}
    />
  );
});
