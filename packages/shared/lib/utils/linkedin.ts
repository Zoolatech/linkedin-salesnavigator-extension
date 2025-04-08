import type { RecordedXHR, ParserConfig } from './shared-types.js';

export const parserModelLinkedin: ParserConfig = {
  entities: {
    Person: {
      fieldID: 'entityUrn',
      fields: {
        fullName: 'Full Name',
        firstName: 'First Name',
        lastName: 'Last Name',
        geoRegion: 'Location',
        account: 'Account',
        company: 'Company',
        title: 'Title',
        degree: 'Relationships',
        associatedAccountRef: { entityRef: 'Account' },
        associatedAccountURL: { displayName: 'Account URL', type: 'url', fetch: true },
        entityUrn: 'Entity URN',
      },
    },
  },
  parsers: [
    {
      entity: 'Person',
      urlMatcher: /linkedin.com\/sales-api\/salesApiPeopleSearch/i,
      extractor: (data: RecordedXHR) => {
        const responseObject = data.responseObject;
        const elements = responseObject.elements || [];
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        return elements.map((el: any) => ({
          fullName: el.fullName || '',
          firstName: el.firstName || '',
          lastName: el.lastName || '',
          geoRegion: el.geoRegion || '',
          account: el.leadAssociatedAccountResolutionResult?.name || '',
          company: el.currentPositions?.[0]?.companyName || '',
          title: el.currentPositions?.[0]?.title || '',
          degree: el.degree || '',
          associatedAccountRef: el.leadAssociatedAccountResolutionResult?.entityUrn || '',
          associatedAccountURL: el.leadAssociatedAccountResolutionResult?.entityUrn || '',
          entityUrn: el.entityUrn || '',
        }));
      },
    },
  ],
};
