export default `
:host {
  display: flex;
  flex-direction: row;
  gap: 5px;

  input {
    min-width: 200px;
    width: 30vw;
    background: var(--input-background);
    color: var(--input-color);
    border: 1px solid var(--input-border-color);
    border-radius: var(--input-border-radius);
    padding: 0 5px;
    outline: none;
    transition-property: border-color,background, color;
    transition-duration: 0.2s;
    transition-timing-function: ease-in-out;
    
    &:hover {
        background: var(--input-hover-background);
        color: var(--input-hover-color);
        border-color: var(--input-hover-border-color);
    }
    
    &:focus, &:focus-visible {
        background: var(--input-focus-background);
        color: var(--input-focus-color);
        border-color: var(--input-focus-border-color);
    }
  }

  .input-wrapper {
    display: flex;
    flex-direction: column;
    gap: 3px;
    position: relative;

    input {
      flex: 1 1 auto;
    }

    .error-message {
      position: absolute;
      top: calc(100% + 5px);
      color: var(--error-color);
      background: var(--error-background);
      font-size: 10px;
      user-select: none;
      padding: 2px 5px;
      border-radius: 5px;
      box-sizing: border-box;
      width: 100%;

      &.hidden {
        display: none;
      }
    }
  }
}
`
