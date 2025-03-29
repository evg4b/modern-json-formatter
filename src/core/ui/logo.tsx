const imagesMap = {
  '512': './icon512.png',
  '256': './icon256.png',
  '128': './icon128.png',
  '48': './icon48.png',
  '32': './icon32.png',
};

interface LogoProps {
  size: keyof typeof imagesMap;
  alt?: string;
  className?: string;
}

export const Logo = ({ size, alt, className: className }: LogoProps) => (
  <img
    src={ imagesMap[size] }
    alt={ alt ?? 'Modern JSON Formatter' }
    className={ className }
  />
);
