import { Mock, Scenario, Suite } from '@qaflag/core';
import { XmlContext, XmlScenario } from '@qaflag/xml';
import { readFileSync } from 'fs';
import path = require('path');
import { GuestPersona } from '../personas/guest.persona';

Mock.on('GET http://localhost/music', {
  statusCode: 200,
  data: async () => {
    return readFileSync(
      path.resolve(__dirname, '../../fixtures/cd-list.xml'),
      'utf8',
    );
  },
});

export class XmlMusicSuite extends Suite(XmlScenario, {
  title: 'Test XML Scenario',
  persona: GuestPersona,
}) {
  @Scenario({
    uri: 'GET http://localhost/music',
    statusCode: 200,
  })
  async getListOfCds(context: XmlContext) {
    const title = context.exists('cd title').first.as('First CD Title');
    title.text.as('Title of the CD').must.be.equalTo('Empire Burlesque');
    title.tagName.must.equal('title');
    const artists = context.find('cd artist').mapText().as('Artists');
    artists.first.must.be.a.string();
    artists.must.all.be.a.string();
    artists.must.have.none.be.an.emptyString();
  }
}
