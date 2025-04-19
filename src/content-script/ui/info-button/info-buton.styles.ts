export default `
:host {
  display: inline-flex;

  a {
    display: flex;
    justify-content: center;
    align-items: center;
    color: var(--icon-color);
    transition: all 150ms ease;

    &:hover {
      color: var(--icon-hover-color);
    }
  }
}
`
