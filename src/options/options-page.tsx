import { Logo } from '@core/ui/logo';
import { useEffect, useRef, useState } from 'preact/hooks';
import { GithubButton, ChromeWebStoreButton, KoFiButton } from '@core/ui/buttons';

// const useStyles = (styles: string) => {
//   const ref = useRef<HTMLElement>(null);
//   useEffect(() => {
//     const demo = ref.current?.attachShadow({ mode: 'closed' }) ?? throws('Shadow DOM not supported');
//     registerStyles(demo, styles);
//     console.log(ref.current);
//   }, [ref.current]);
// }

export const OptionsPage = () => {
  const ref = useRef(null);
  const [val, setVal] = useState(0);

  useEffect(() => {
    console.log(ref.current);
  }, []);

  useEffect(() => {
    setInterval(() => {
      setVal(p => p + 1);
    }, 1500);
  }, []);

  return (
    <div class="d-flx flx-column" ref={ ref }>
      <div class="d-flx flx-row flx-center">
        <Logo size="48" />
        <h1>Modern JSON Formatter Options</h1>
      </div>
      <p>Options page content</p>
      <div>
        <GithubButton href="#" title="kldfjsdlkfj" />
        <ChromeWebStoreButton href="#" title="kldfjsdlkfj" />
        <KoFiButton href="#" title="kldfjsdlkfj" />
      </div>
    </div>
  );
};



