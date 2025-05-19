export interface NavigationItem {
  id: string;
  title: string;
  titleHtml: string;
  children?: NavigationItem[];
  ref: HTMLElement;
}
