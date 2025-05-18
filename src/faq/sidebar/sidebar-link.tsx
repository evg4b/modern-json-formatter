import { clsx } from 'clsx';
import { FC, memo, type MouseEvent, RefObject, useCallback, useEffect, useMemo, useRef } from 'react';
import { NavigationItem } from './sidebar';
import { active, link } from './sidebar-link.module.css';

interface SidebarLinkProps {
  item: NavigationItem;
  className?: string;
  mainRef: RefObject<HTMLElement | null>;
  activeId: string | null;
}

function isInViewport(element: HTMLElement) {
  const rect = element.getBoundingClientRect();
  return (
    rect.top >= 0 &&
    rect.left >= 0 &&
    rect.bottom <= (window.innerHeight || document.documentElement.clientHeight) &&
    rect.right <= (window.innerWidth || document.documentElement.clientWidth)
  );
}

const SidebarLinkInner: FC<SidebarLinkProps> = ({ item, mainRef, className, activeId }) => {
  const ref = useRef<HTMLAnchorElement>(null);

  const handleClick = useCallback((e: MouseEvent<HTMLAnchorElement>) => {
    e.preventDefault();
    item.ref.scrollIntoView({ behavior: 'smooth' });
  }, [mainRef]);

  const isActive = useMemo(() => activeId === item.id, [activeId, item.id]);

  useEffect(() => {
    if (isActive && ref.current && !isInViewport(ref.current)) {
      ref.current.scrollIntoView({
        behavior: 'smooth',
        block: 'nearest',
        inline: 'nearest',
      })
    }
  }, [isActive]);

  return (
    <a href="#"
       onClick={ handleClick }
       title={ item.title }
       className={ clsx(link, className, { [active]: item.id === activeId }) }
       dangerouslySetInnerHTML={ { __html: item.titleHtml } }
       ref={ ref }
    />
  );
};

export const SidebarLink = memo(SidebarLinkInner);
