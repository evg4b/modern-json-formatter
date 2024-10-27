document.addEventListener('DOMContentLoaded', () => {
  const sections = Array.from(document.querySelectorAll('section'));
  const links = Array.from(document.querySelectorAll('.item a')) as HTMLAnchorElement[];

  console.log(links, sections);

  const sectionsMap = new Map<string, HTMLElement>();
  sections.forEach(section => sectionsMap.set(`#${section.id}`, section));

  const linksMap = new Map<string, HTMLElement>();
  links.forEach(link => linksMap.set(link.hash, link));


  const handleClick = (e: PointerEvent) => {
    e.preventDefault();

    const section  = sectionsMap.get(e.target?.hash);
    section?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

// Attach a click event listener to each link
  links.forEach((link) => {
    link.addEventListener('click', handleClick);
  });

// Function to handle scroll events
  const handleScroll = () => {
    // Get the current scroll position
    const scrollPos = window.scrollY + window.innerHeight / 2;

    // Loop through all of the sections
    sections.forEach((section) => {
      // Get the top and bottom positions of the section
      const top = section.offsetTop;
      const bottom = top + section.offsetHeight;

      // Check if the scroll position is within the section
      if (scrollPos >= top && scrollPos <= bottom) {
        // Get the link that corresponds to the section
        const link = document.querySelector(`a[href="#${ section.id }"]`);

        // Add the "active" class to the link
        link?.classList.add('active');
      } else {
        // Get the link that corresponds to the section
        const link = document.querySelector(`a[href="#${ section.id }"]`);

        // Remove the "active" class from the link
        link?.classList.remove('active');
      }
    });
  };

// Attach a scroll event listener to the window
  window.addEventListener('scroll', handleScroll);

});
