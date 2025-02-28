import { clsx } from 'clsx';
import { ComponentChildren, ComponentProps } from 'preact';
import { button } from './button.module.css';

interface ButtonProps extends ComponentProps<'button'> {
  children: ComponentChildren,
}

export function Button({ children, class: className, ...props }: ButtonProps) {
  return (
    <button class={ clsx(button, className) } { ...props }>
      { children }
    </button>
  );
}
