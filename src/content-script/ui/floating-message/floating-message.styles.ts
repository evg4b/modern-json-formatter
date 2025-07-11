export default `

:host {
  display: flex;
  position: fixed;
  right: 25px;
  bottom: 15px;
  padding: 10px;
  background: #282828;
  color: #eee;
  box-shadow: 0 5px 10px 0 rgb(0 0 0 / 70%);
  border-radius: 5px;
  font-size: 10px;
  flex-direction: column;
  max-width: 300px;
  user-select: none;
  opacity: 1;
  transform: translateY(0);
  transition: all 250ms ease-in-out;
  
  .header-container {
    display: flex;
    flex-direction: row;

    .header {
      flex: 1 1 auto;
      margin-bottom: 5px;
      font-size: 12px;
    }

    .close {
      cursor: pointer;
      width: 12px;
      height: 12px;
      position: relative;

      &:before,
      &:after {
        position: absolute;
        width: 2px;
        background-color: #eee;
        left: 5px;
        content: " ";
        height: 12px;
      }

      &:before {
        transform: rotate(45deg);
      }

      &:after {
        transform: rotate(-45deg);
      }
    }
  }

  .body {
    display: flex;
    flex-direction: column;
    color: #9b9b9b;
    overflow: auto;
  }
}

:host(.error-message),
:host(.error-message) .header-container, 
:host(.error-message) .body {
  background: var(--error-background) !important;
  color: var(--error-color) !important;
}

:host.hidden,
:host-context(.hidden) {
  opacity: 0;
  transform: translateY(50%);
}
`
