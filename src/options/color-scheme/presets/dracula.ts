import { ColorScheme } from '../models';

export const dracula: ColorScheme = {
  '--container-padding': '30px',
  '--background': '#282a36',
  '--base-text-color': '#f8f8f2',
  '--indentation': '30px',
  '--font-size': '14px',
  '--meta-info-color': '#717171',
  '--guideline-color': '#3b3b3b',
  '--guideline-style': 'dotted',
  '--string-literal-color': '#5dd9ff',
  '--boolean-literal-color': '#9f84ff',
  '--number-literal-color': '#9f84ff',
  '--null-literal-color': '#717171',
  '--object-key-color': '#7dadf9',
  '--bracket-color': '#eeeeee',
  '--colon-color': '#eeeeee',
  '--comma-color': '#eeeeee',
  '--toggle-color': '#575757',
  '--toggle-hover-color': '#a6a6a6',
  '--toggle-size': '17px',
} as const;
