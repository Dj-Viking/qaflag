import { Logger } from '../models/logger';
import { HttpVerbs } from '../types/http-methods';
import { MessageInterface, MessageType } from '../types/message.interface';
import { RequestInterface } from '../types/request.interface';
import { ResponseInterface } from '../types/response.interface';
import { ScenarioInterface } from '../types/scenario.interface';
import { ScenarioOpts } from '../types/scenario.types';
import { SuiteInterface } from '../types/suite.interface';

export type ScenarioTypeOpts = {
  name: string;
};

export function ScenarioType(initOpts: ScenarioTypeOpts) {
  abstract class ScenarioAbstract implements ScenarioInterface {
    constructor(
      public readonly opts: ScenarioOpts,
      public readonly suite: SuiteInterface,
    ) {
      this.key = opts.key;
      this.description = opts.description;
      this.step = opts.step || 1;
      this.next = opts.next;
    }

    public abstract response: ResponseInterface | null;
    public abstract request: RequestInterface;
    public abstract execute(): Promise<void>;

    public name: string = initOpts.name;
    public key: string | Symbol;
    public description: string;
    public step: number;
    public next: (...args: any[]) => Promise<void>;
    public readonly logger = new Logger();

    public get uri() {
      return this.request.uri;
    }

    public get method(): HttpVerbs {
      return this.request.method;
    }

    public get path(): string {
      return this.request.path;
    }

    public get hasFailures(): boolean {
      return this.failures.length > 0;
    }

    public get failures(): MessageInterface[] {
      return this.logger.filter('fail');
    }

    public get passes(): MessageInterface[] {
      return this.logger.filter('pass');
    }

    public log(type: MessageType, text: string): void {
      this.logger.log(type, text);
    }
  }
  return ScenarioAbstract;
}
