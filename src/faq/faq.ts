import './buttons/github-button';
import './buttons/chrome-web-store-button';
import './buttons/ko-fi-button';

document.addEventListener('DOMContentLoaded', () => {
  const sections = document.querySelectorAll('main section') as NodeListOf<HTMLElement>;
  const links = document.querySelectorAll('a.item') as NodeListOf<HTMLAnchorElement>;

  const sectionsMap = new Map<string, HTMLElement>();
  sections.forEach(section => sectionsMap.set(`#${ section.id }`, section));

  const linksMap = new Map<string, HTMLElement>();
  links.forEach(link => linksMap.set(link.hash, link));

  const handleClick: EventListener = e => {
    e.preventDefault();
    if (e.target instanceof HTMLAnchorElement) {
      const section = sectionsMap.get(e.target.hash);
      section?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  links.forEach(link => {
    link.addEventListener('click', handleClick);
  });

  const handleScroll = () => {
    const scrollPosition = window.scrollY + window.innerHeight / 2;
    sections.forEach(section => {
      const top = section.offsetTop;
      const bottom = top + section.offsetHeight;
      const link = linksMap.get(`#${ section.id }`);
      if (link) {
        if (scrollPosition >= top && scrollPosition <= bottom) {
          link.classList.add('active');
          if (!link.classList.contains('section-header')) {
            link.scrollIntoView({
              behavior: 'smooth',
              block: 'nearest',
              inline: 'nearest',
            });
          }
        } else {
          link.classList.remove('active');
        }
      }
    });
  };

  window.addEventListener('scroll', handleScroll);
  handleScroll();
});
