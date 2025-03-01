export default `
:host {
  display: flex;
  flex-direction: row;
  gap: 5px;

  input {
    min-width: 200px;
    width: 30vw;
    background: #3b3b3b;
    border: 1px solid #858585;
    border-radius: 2px;
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
      color: #e46962;
      font-size: 10px;
      user-select: none;

      background: var(--background-color);
      padding: 2px;
      box-shadow: 0 0 2px 1px var(--background-color);

      &.hidden {
        display: none;
      }
    }
  }
}
`
