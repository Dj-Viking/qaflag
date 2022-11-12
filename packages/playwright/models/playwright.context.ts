import {
  Context,
  ContextInterface,
  ScenarioInterface,
  StringValue,
} from '@qaflag/core';
import { Locator, PageScreenshotOptions } from 'playwright';
import { PlaywrightInstance } from './playwright.adapter';
import { PlaywrightValue } from './playwright.value';
import { ClickOpts } from './pointer';
import { WaitForNavigationOpts, WaitForUrlOpts } from './wait-for';
import FindQuery from '../selectors/find-query';
import SelectFilter from '../selectors/select-filter';

export type NavigationOpts =
  | {
      timeout?: number | undefined;
      waitUntil?:
        | 'load'
        | 'domcontentloaded'
        | 'networkidle'
        | 'commit'
        | undefined;
    }
  | undefined;

export type FindOpts = {
  has?: Locator;
  hasText?: string | RegExp;
};

export class PlaywrightContext extends Context implements ContextInterface {
  constructor(
    public readonly scenario: ScenarioInterface,
    protected readonly playwright: PlaywrightInstance,
  ) {
    super(scenario);
  }

  public get url() {
    return new StringValue(this.page.url(), {
      name: 'URL',
      logger: this.logger,
    });
  }

  public get page() {
    return this.playwright.page;
  }

  public get browser() {
    return this.playwright.browser;
  }

  public get browserContext() {
    return this.playwright.context;
  }

  public find(
    selector: string | FindQuery,
    ...subQueries: Array<SelectFilter | string | FindQuery>
  ): PlaywrightValue {
    const inputQuery = FindQuery.create(selector);
    const finalQuery = inputQuery.apply(subQueries);
    console.log(finalQuery.selector);
    return new PlaywrightValue(
      this.playwright.page.locator(finalQuery.selector),
      {
        selector: finalQuery.selector,
        name: finalQuery.name,
        logger: this.scenario.logger,
      },
    );
  }

  public async exists(
    selector: string | FindQuery,
    ...subQueries: Array<SelectFilter | string | FindQuery>
  ) {
    const element = this.find(selector, ...subQueries);
    await element.must.exist();
    return element;
  }

  protected async getClosest(
    selector: string,
    to: PlaywrightValue,
    opts: {
      maxDistance?: number;
      position?: 'above' | 'below' | 'beside';
    } = {},
  ) {
    const elements = await this.find(selector).queryAll();
    const location = await to.boundingBox();
    const name = `Closest ${selector} to ${to.name}`;
    if (elements.length == 0 || !location) {
      throw `Could not find any ${selector} close to ${to.name}`;
    }
    let min: number | null = null;
    let smallestIndex: number | null = null;
    for (let i = 0; i < elements.length; i++) {
      const current = elements[i];
      const currentBox = await current.boundingBox();
      if (!currentBox) continue;
      const distances = [
        !opts.position || opts.position == 'below'
          ? Math.abs(currentBox.top - location.bottom) +
            Math.abs(currentBox.left - location.left)
          : undefined,
        !opts.position || opts.position == 'above'
          ? Math.abs(currentBox.bottom - location.top) +
            Math.abs(currentBox.left - location.left)
          : undefined,
        !opts.position || opts.position == 'beside'
          ? Math.abs(currentBox.top - location.top) +
            Math.abs(currentBox.right - location.left)
          : undefined,
        !opts.position || opts.position == 'beside'
          ? Math.abs(currentBox.top - location.top) +
            Math.abs(currentBox.left - location.right)
          : undefined,
      ].filter(n => !!n) as number[];
      const diff = Math.min(...distances);
      if (
        (!opts?.maxDistance || diff < opts.maxDistance) &&
        (min === null || diff < min)
      ) {
        smallestIndex = i;
        min = diff;
      }
    }
    if (smallestIndex === null) {
      throw `Could not find any ${selector} close to ${to.name}`;
    }
    return elements[smallestIndex].as(name);
  }

  public async title() {
    const title = await this.page.title();
    return this.stringValue(title, 'Page Title');
  }

  public screenshot(opts: PageScreenshotOptions) {
    return this.page.screenshot(opts);
  }

  public reload(opts: NavigationOpts) {
    return this.page.reload(opts);
  }

  public goForward(opts: NavigationOpts) {
    return this.page.goForward(opts);
  }

  public goBack(opts: NavigationOpts) {
    return this.page.goBack(opts);
  }

  public goTo(url: string, opts: NavigationOpts) {
    return this.page.goto(url, opts);
  }

  public waitForNavigation(opts?: WaitForNavigationOpts) {
    return this.page.waitForNavigation(opts);
  }

  public waitForSelector(selector: string) {
    return this.page.waitForSelector(selector);
  }

  public waitForURL(
    url: string | RegExp | ((url: URL) => boolean),
    opts?: WaitForUrlOpts,
  ) {
    return this.page.waitForURL(url, opts);
  }

  public pause(millseconds: number) {
    this.logger.action('PAUSE', undefined, `${millseconds}ms`);
    return this.page.waitForTimeout(millseconds);
  }

  public async click(element: PlaywrightValue, opts: ClickOpts) {
    if (this.persona.hasMouse) await element.mouse.click(opts);
    else if (this.persona.hasTouch) await element.touch.click(opts);
    else if (this.persona.hasRemote) await element.mouse.click(opts);
    else if (this.persona.hasKeyboard) await element.keyboard.press('Enter');
    return element;
  }
}
