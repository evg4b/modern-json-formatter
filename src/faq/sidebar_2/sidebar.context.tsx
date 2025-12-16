import { first } from 'lodash';
import {
  createContext,
  FC,
  PropsWithChildren,
  RefObject,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';
import { type NavigationItem } from './models';

export interface SidebarContextType {
  contentRef: RefObject<HTMLElement | null>;
  navigation: NavigationItem[];
  activeId: string | null;
  selectItem: (item: NavigationItem) => void;
}

export const SidebarContext = createContext<SidebarContextType>({} as SidebarContextType);

export const SidebarProvider: FC<PropsWithChildren> = ({ children }) => {
  const contentRef = useRef<HTMLElement>(null);
  const [navigation, setNavigation] = useState<NavigationItem[]>([]);
  const [activeId, setActiveId] = useState<string | null>(null);

  useEffect(() => {
    const sections = contentRef.current?.querySelectorAll('section');
    const navigationItems = Array.from(sections ?? [])
      .flatMap<NavigationItem>(section => {
        const header = section.querySelector('h2');
        if (!header) {
          return [];
        }

        return {
          id: header.id,
          title: header.textContent,
          titleHtml: header.innerHTML,
          ref: header,
          children: Array.from(section.querySelectorAll('h3'))
            .map<NavigationItem>(subHeader => ({
              id: subHeader.id,
              title: subHeader.textContent,
              titleHtml: subHeader.innerHTML,
              ref: subHeader,
            })),
        } satisfies NavigationItem;
      });

    setNavigation(navigationItems);
  }, [contentRef]);

  useEffect(() => {
    const handleScroll = () => {
      const visibleItems = navigation
        .flatMap(item => [item, ...(item.children ?? [])])
        .map(item => {
          const rect = item.ref.getBoundingClientRect();
          return {
            id: item.id,
            top: rect.top,
            offset: Math.abs(rect.top),
          };
        })
        .filter(item => item.top < window.innerHeight)
        .sort((a, b) => a.offset - b.offset);

      const activeItem = first(visibleItems);
      if (activeItem) {
        setActiveId(activeItem.id);
      }
    };

    handleScroll();

    window.addEventListener('scroll', handleScroll, { passive: true });

    return () => {
      window.removeEventListener('scroll', handleScroll, { capture: true });
    };
  }, [navigation]);

  const selectItem = useCallback((item: NavigationItem) => {
    setActiveId(item.id);
    item.ref.scrollIntoView({ behavior: 'smooth' });
  }, [setActiveId]);

  const contextValue = useMemo<SidebarContextType>(() => ({
    contentRef,
    navigation,
    activeId,
    selectItem,
  }), [contentRef, navigation, activeId, selectItem]);

  return (
    <SidebarContext.Provider value={ contextValue }>
      { children }
    </SidebarContext.Provider>
  );
};

export const useSidebar = () => useContext(SidebarContext);
