import { ColorScheme } from '../models';
import { dracula } from './dracula';
import { googleChrome } from './google-chrome';

export const presets: Record<string, ColorScheme> = {
  'Google Chrome': googleChrome,
  'Dracula': dracula,
};
