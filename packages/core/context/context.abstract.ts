import { DebugContent } from '../types/log-provider.interface';
import { ContextInterface } from './context.interface';
import { ScenarioInterface } from '../scenario/scenario.interface';
import { LogContent } from '../models/log-message';
import {
  ArrayValue,
  BooleanValue,
  NumericValue,
  StringValue,
} from '../value/values';

export abstract class Context implements ContextInterface {
  constructor(public readonly scenario: ScenarioInterface) {}

  public get persona() {
    return this.scenario.persona;
  }

  public get logger() {
    return this.scenario.logger;
  }

  public debug(messages: DebugContent | DebugContent[]) {
    this.logger.debug(messages);
  }

  public info(messages: string | string[]) {
    this.logger.info(messages);
  }

  public heading(messages: string | string[]) {
    this.logger.heading(messages);
  }

  public fail(content: string | LogContent | LogContent[]) {
    this.logger.fail(content);
  }

  public pass(content: string | LogContent | LogContent[]) {
    this.logger.pass(content);
  }

  public async group<T>(heading: string, tests: () => Promise<T>) {
    this.logger.heading(heading);
    const result = await tests();
    this.logger.lineBreak();
    return result;
  }

  protected stringValue(input: string, name: string) {
    return new StringValue(input, {
      name,
      logger: this.logger,
    });
  }

  protected numericValue(input: number, name: string) {
    return new NumericValue(input, {
      name,
      logger: this.logger,
    });
  }

  protected booleanValue(input: boolean, name: string) {
    return new BooleanValue(input, {
      name,
      logger: this.logger,
    });
  }

  protected arrayValue<T>(input: T[], name: string) {
    return new ArrayValue(input, {
      name,
      logger: this.logger,
    });
  }
}
