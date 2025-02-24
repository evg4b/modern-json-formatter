const imagesMap = {
  '512': './icon512.png',
  '256': './icon256.png',
  '128': './icon128.png',
  '48': './icon48.png',
  '32': './icon32.png',
};

type ima = keyof typeof imagesMap;

interface LogoProps {
  size: ima;
  alt?: string;
}

export const Logo = ({ size, alt }: LogoProps) => {
  return (
    <img src={ imagesMap[size] } alt={ alt ?? 'Modern JSON Formatter' }/>
  );
};
