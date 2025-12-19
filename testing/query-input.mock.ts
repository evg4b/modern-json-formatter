import { CustomElement } from '@core/dom';
import { rstest } from '@rstest/core';

@CustomElement('query-input-old')
export class QueryInputElementMock extends HTMLElement {
  public setErrorMessage = rstest.fn().mockName('QueryInputElementMock.setErrorMessage');
  public onSubmit = rstest.fn().mockName('QueryInputElementMock.onSubmit');
  public override focus = rstest.fn().mockName('QueryInputElementMock.focus');
  public override blur = rstest.fn().mockName('QueryInputElementMock.blur');
  public hide = rstest.fn().mockName('QueryInputElementMock.hide');
  public show = rstest.fn().mockName('QueryInputElementMock.show');
}

rstest.mock('../src/content-script/ui/query-input-old', () => ({
  QueryInputElement: QueryInputElementMock,
}));
