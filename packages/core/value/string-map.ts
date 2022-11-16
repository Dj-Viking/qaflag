import { test, Test } from '../test/test';
import { StringValue, ValueAbstract, ValueOpts } from './values';

type StringMap<T> = Record<keyof T, string>;

export class StringMapValue<T> extends ValueAbstract<StringMap<T>> {
  constructor(
    protected readonly input: StringMap<T>,
    protected opts: ValueOpts,
  ) {
    super(input, opts);
  }

  public get must(): Test<typeof this> {
    return test(this, 'must');
  }

  public get should(): Test<typeof this> {
    return test(this, 'should');
  }

  public get could(): Test<typeof this> {
    return test(this, 'could');
  }

  public find(key: keyof T) {
    return new StringValue(this.input[key], {
      name: String(key),
      context: this.context,
    });
  }
}
