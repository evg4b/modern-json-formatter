export default `
:host {
  display: flex;
  justify-content: space-between;
  margin-bottom: 10px;
  position: fixed;
  top: 15px;
  right: 30px;

  background: var(--background-color);
  padding: 2px;
  box-shadow: 0 0 2px 1px var(--background-color);
  gap: 10px;

  .button-container {
    display: flex;
    flex-direction: row;

    button {
      &:first-child {
        border-bottom-left-radius: 5px;
        border-top-left-radius: 5px;
      }

      &:last-child {
        border-bottom-right-radius: 5px;
        border-top-right-radius: 5px;
      }

      &:hover {
        background: #525252;
      }

      &.active {
        background: #2c2c2c;
        color: #b4b2b2;
        cursor: default;
      }

      padding: 5px 10px;
      background: #3b3b3b;
      color: #eeeeee;
      border: none;
      cursor: pointer;
      font-size: 14px;
      font-weight: 500;
      transition: background 0.3s;
      min-width: 41px;
      display: block;
      user-select: none;
    }
  }
}
`
