import { clsx } from 'clsx';
import { ComponentChildren } from 'preact';
import { type HTMLAttributes } from 'preact/compat';
import {
  flexAlignBaseline,
  flexAlignCenter,
  flexAlignEnd,
  flexAlignStart,
  flexAlignStretch,
  flexJustifyCenter,
  flexJustifyEnd,
  flexJustifySpaceAround,
  flexJustifySpaceBetween,
  flexJustifySpaceEvenly,
  flexJustifyStart,
  flexRow,
  flexColumn,
} from './flex.module.css';

interface DivProps extends Omit<HTMLAttributes<HTMLDivElement>, 'class'> {
  children: ComponentChildren;
  class?: string;
  justify?: 'center' | 'space-between' | 'space-around' | 'space-evenly' | 'flex-start' | 'flex-end';
  align?: 'center' | 'flex-start' | 'flex-end' | 'baseline' | 'stretch';
}

export const Row = ({ children, justify, align, ...sped }: DivProps) => {
  const className = clsx(
    flexRow,
    sped.class,
    justify === 'center' && flexJustifyCenter,
    justify === 'flex-start' && flexJustifyStart,
    justify === 'flex-end' && flexJustifyEnd,
    justify === 'space-between' && flexJustifySpaceBetween,
    justify === 'space-around' && flexJustifySpaceAround,
    justify === 'space-evenly' && flexJustifySpaceEvenly,
    align === 'center' && flexAlignCenter,
    align === 'flex-start' && flexAlignStart,
    align === 'flex-end' && flexAlignEnd,
    align === 'baseline' && flexAlignBaseline,
    align === 'stretch' && flexAlignStretch,
  );

  return (
    <div { ...sped } class={ className }>
      { children }
    </div>
  );
};

export const Column = ({ children, justify, align, ...sped }: DivProps) => {
  const className = clsx(
    flexColumn,
    sped.class,
    justify === 'center' && flexJustifyCenter,
    justify === 'flex-start' && flexJustifyStart,
    justify === 'flex-end' && flexJustifyEnd,
    justify === 'space-between' && flexJustifySpaceBetween,
    justify === 'space-around' && flexJustifySpaceAround,
    justify === 'space-evenly' && flexJustifySpaceEvenly,
    align === 'center' && flexAlignCenter,
    align === 'flex-start' && flexAlignStart,
    align === 'flex-end' && flexAlignEnd,
    align === 'baseline' && flexAlignBaseline,
    align === 'stretch' && flexAlignStretch,
  );

  return (
    <div { ...sped } class={ className }>
      { children }
    </div>
  );
};
