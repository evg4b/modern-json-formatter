export default `
:host {  
  display: flex;
  justify-content: space-between;
  margin-bottom: 10px;
  background: var(--background);
  box-shadow: 0 0 3px 3px var(--background);
  gap: 10px;

  .button-container {
    display: flex;
    flex-direction: row;
    gap: 5px;

    button {      
      border-radius: 5px;
      padding: 3px 10px;
      background: var(--button-background);
      color: var(--button-color);
      border: 1px solid var(--button-border-color);
      cursor: pointer;
      font-size: 14px;
      font-weight: 500;
      min-width: 40px;
      display: block;
      user-select: none;
      transition-property: background, background-color, border-color, color;
      transition-duration: 0.2s;
      transition-timing-function: ease-in-out;

      &:hover {
        background: var(--button-hover-background);
        border-color: var(--button-hover-border-color);
        color: var(--button-hover-color);
      }

      &.active {
        background: var(--button-active-background);
        border-color: var(--button-active-border-color);
        color: var(--button-active-color);
        cursor: default;
      }
    }
  }
}
`
