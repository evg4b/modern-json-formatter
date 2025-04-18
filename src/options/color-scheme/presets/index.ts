import { ColorScheme } from '../models';
import { dracula } from './dracula';
import { googleChrome } from './google-chrome';
import { monokai } from './monokai';

export const presets: Record<string, ColorScheme> = {
  'Google Chrome': googleChrome,
  'Dracula': dracula,
  'Monokai': monokai,
};
