import { getURL } from '@core/browser';
import { FC, useEffect, useRef } from 'react';
import { ColorScheme } from '../models';
import { previewContainer } from './preview.module.css';

const previewPageUrl = getURL('color-scheme-preview.html');

export interface PreviewProps {
  preset: ColorScheme;
}

export const Preview: FC<PreviewProps> = ({ preset }) => {
  const ref = useRef<HTMLIFrameElement>(null);

  useEffect(() => {
    if (!ref.current?.contentWindow) {
      return;
    }

    ref.current.contentWindow.postMessage(preset);
  }, [preset, ref.current?.contentWindow]);

  return (
    <iframe ref={ ref }
            src={ previewPageUrl }
            className={ previewContainer }
    />
  );
};
