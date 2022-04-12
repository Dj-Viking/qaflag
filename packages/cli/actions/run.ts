import { findSuites } from '../utils/find-suites';
import { exitError } from '../utils/exit';
import { prompt } from 'prompts';
import { loadSuite } from '../utils/load-suite';
import { outputSuiteToConsole } from '../formatter/console';
import { SuiteClass, SuiteCollection } from '../types/suite-collection';
import Project from '../models/project';
import { Command } from 'commander';
import * as pLimit from 'p-limit';
import { printLines } from '../utils/print';

export const run = async (
  project: Project,
  command: Command,
  options: { [key: string]: string | boolean },
) => {
  const suites = findSuites(project);
  const selections = options.all
    ? suites.suiteClasses
    : command.args?.length
    ? findSuiteByName(suites, command.args)
    : [await pickSuite(suites)];
  if (!selections.length) return exitError('No suites selected.');
  const limit = pLimit(1);
  const completed = await Promise.all(
    selections.map(selection =>
      limit(async () => {
        const suite = loadSuite(selection);
        suite.events.once('completed').then(() => outputSuiteToConsole(suite));
        await suite.execute();
        return suite;
      }),
    ),
  );
  if (selections.length > 1) {
    const results = completed.map(suite => suite.results.status == 'pass');
    printLines([
      '',
      'Suite Results:',
      `${results.filter(pass => pass).length} passed`,
      `${results.filter(pass => !pass).length} failed`,
      '',
    ]);
  }
};

const findSuiteByName = (
  suites: SuiteCollection,
  names: string[],
): SuiteClass[] => {
  const out: SuiteClass[] = [];
  names.forEach(name => {
    const pattern = new RegExp('^' + name.replace('*', '.*') + '$', 'i');
    const matches = suites.suiteClasses.filter(suite =>
      pattern.test(suite.className),
    );
    if (matches.length) out.push(...matches);
  });
  return out;
};

const pickSuite = async (suites: SuiteCollection): Promise<SuiteClass> => {
  if (suites.suiteClasses.length == 0) {
    return exitError('No suites found.');
  }
  const selection = await prompt({
    type: 'select',
    name: 'suite',
    message: 'Pick a suite',
    choices: suites.suiteClasses.map(suite => ({
      title: suite.className,
      description: suite.relativePath,
      value: suite,
    })),
    initial: 0,
  });
  return selection.suite;
};
