import { After } from './common/decorators/after.decorator';
import { Before } from './common/decorators/before.decorator';
import { Scenario } from './common/decorators/scenario.decorator';
import { ConsoleFormatter } from './common/formatter/console';
import { Suite } from './common/mixin/suite.mixin';
import { GuestPersona } from './examples/guest.persona';
import { StandardUserPersona } from './examples/user.persona';
import { JsonResponse } from './json/json.response';
import { JsonScenario } from './json/json.scenario';

class UsersSuite extends Suite(JsonScenario, {
  title: 'Test Users Endpoints',
  persona: GuestPersona,
}) {
  @Scenario({
    uri: 'GET https://jsonplaceholder.typicode.com/users',
    step: 1,
    statusCode: 200,
    persona: StandardUserPersona,
    schema: { name: '@getUsers' },
  })
  async getListOfUsers(response: JsonResponse) {
    const ids = response.find('[*].id').array;
    ids.length.is.greaterThan(0);
    ids.first.number.is.greaterThan(0);
    this.set('userId', ids.first.$);
  }

  @Scenario({
    description: 'Get one user',
    uri: 'GET https://jsonplaceholder.typicode.com/users/{userId}',
    step: 2,
  })
  async getOneUser(response: JsonResponse) {
    response.find('email').is.email();
    response.find('email').type.is.equalTo('string');
  }
}

const suite = new UsersSuite();
suite.events.once('complete').then(() => {
  ConsoleFormatter.printSuite(suite);
});
