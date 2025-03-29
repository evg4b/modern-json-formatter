import { clsx } from 'clsx';
import { ComponentChildren, ComponentProps } from 'preact';
import { button } from './button.module.css';

interface ButtonProps extends ComponentProps<'button'> {
  readonly children: ComponentChildren,
}

export const Button = ({ children, class: className, ...props }: ButtonProps) => (
  <button class={ clsx(button, className) } { ...props }>
    { children }
  </button>
);
