document.addEventListener('DOMContentLoaded', () => {
  const sections = Array.from(document.querySelectorAll('section'));
  const links = Array.from(document.querySelectorAll('a.item')) as HTMLAnchorElement[];

  const sectionsMap = new Map<string, HTMLElement>();
  sections.forEach(section => sectionsMap.set(`#${section.id}`, section));

  const linksMap = new Map<string, HTMLElement>();
  links.forEach(link => linksMap.set(link.hash, link));

  const handleClick: EventListener = e => {
    e.preventDefault();

    const section = sectionsMap.get(e.target?.hash);
    section?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

  links.forEach(link => {
    link.addEventListener('click', handleClick);
  });

  const handleScroll = () => {
    const scrollPos = window.scrollY + window.innerHeight / 2;
    sections.forEach(section => {
      const top = section.offsetTop;
      const bottom = top + section.offsetHeight;
      const link = linksMap.get(`#${section.id}`);
      if (scrollPos >= top && scrollPos <= bottom) {
        link?.classList?.add('active');
        link?.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
      } else {
        link?.classList?.remove('active');
      }
    });
  };

  window.addEventListener('scroll', handleScroll);
  handleScroll();
});
