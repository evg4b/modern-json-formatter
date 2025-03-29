import { clsx } from 'clsx';
import { ButtonHTMLAttributes, DetailedHTMLProps, FC } from 'react';
import { button } from './button.module.css';

type ButtonProps = DetailedHTMLProps<ButtonHTMLAttributes<HTMLButtonElement>, HTMLButtonElement>;

export const Button: FC<ButtonProps> = ({ children, className, ...props }) => (
  <button className={ clsx(button, className) } { ...props }>
    { children }
  </button>
);
