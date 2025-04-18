import { getURL } from '@core/browser';
import { FC, useCallback, useEffect, useRef } from 'react';
import { ColorScheme } from '../models';
import { previewContainer } from './preview.module.css';

const previewPageUrl = getURL('color-scheme-preview.html');

export interface PreviewProps {
  preset: ColorScheme;
}

export const Preview: FC<PreviewProps> = ({ preset }) => {
  const ref = useRef<HTMLIFrameElement>(null);

  const updatePreset = useCallback(
    (preset: ColorScheme) => ref.current?.contentWindow?.postMessage(preset),
    [],
  );

  useEffect(() => updatePreset(preset), [preset, updatePreset]);

  return (
    <iframe ref={ ref }
            src={ previewPageUrl }
            className={ previewContainer }
            onLoad={ () => updatePreset(preset) }
    />
  );
};
