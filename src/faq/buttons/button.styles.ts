export default `
:host {
  display: flex;
  flex-direction: column;

  a {
    display: flex;
    flex-direction: column;
    transition: all 0.2s ease-in-out;

    &:hover {
      transform: scale(1.2);
    }
  }
}
`
