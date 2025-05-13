import { FC, type MouseEvent, RefObject, useCallback } from 'react';
import { NavigationItem } from './sidebar';

interface SidebarLinkProps {
  item: NavigationItem;
  className?: string;
  mainRef: RefObject<HTMLElement | null>;
}

export const SidebarLink: FC<SidebarLinkProps> = ({ item, mainRef, className }) => {
  const handleClick = useCallback((e: MouseEvent<HTMLAnchorElement>) => {
    e.preventDefault();
    item.ref.scrollIntoView({ behavior: 'smooth' });
  }, [mainRef]);

  return (
    <a href="#"
       onClick={ handleClick }
       className={ className }
       dangerouslySetInnerHTML={ { __html: item.title } }
    />
  );
};
