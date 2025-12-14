import { CustomElement } from '@core/dom';

@CustomElement('query-input-old')
export class QueryInputElementMock extends HTMLElement {
  public setErrorMessage = jest.fn().mockName('QueryInputElementMock.setErrorMessage');
  public onSubmit = jest.fn().mockName('QueryInputElementMock.onSubmit');
  public focus = jest.fn().mockName('QueryInputElementMock.focus');
  public blur = jest.fn().mockName('QueryInputElementMock.blur');
  public hide = jest.fn().mockName('QueryInputElementMock.hide');
  public show = jest.fn().mockName('QueryInputElementMock.show');
}

jest.mock('../src/content-script/ui/query-input-old', () => ({
  QueryInputElement: QueryInputElementMock,
}));
