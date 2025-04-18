import type { RecordedXHR, ParserConfig, EntityTraits, ValueRecord } from '@extension/shared-types';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function leadIDPart(entityUrn: any): string | undefined {
  return /.*\((.*)\).*/.exec(entityUrn)?.[1];
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function leadDetailsFetchURL(el: any): string | undefined {
  const idPart = leadIDPart(el.entityUrn);
  const detailsQueryParts = idPart?.split(',');
  return detailsQueryParts && detailsQueryParts.length === 3
    ? `https://www.linkedin.com/sales-api/salesApiProfiles/(profileId:${detailsQueryParts[0]},authType:${detailsQueryParts[1]},authToken:${detailsQueryParts[2]})?decoration=%28%0A%20%20entityUrn%2C%0A%20%20objectUrn%2C%0A%20%20firstName%2C%0A%20%20lastName%2C%0A%20%20fullName%2C%0A%20%20degree%2C%0A%20%20location%2C%0A%20%20summary%2C%0A%20%20defaultPosition%2C%0A%20%20contactInfo%2C%0A%20%20flagshipProfileUrl%2C%0A%20%20numOfConnections%2C%0A%20%20numOfSharedConnections%2C%0A%20%20profilePictureDisplayImage%0A%29`
    : undefined;
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function leadDetailsBrowseURL(el: any, data: RecordedXHR): string | undefined {
  const idPart = leadIDPart(el.entityUrn);
  const lipiPartRaw = data?.requestHeaders?.['X-li-page-instance'] || data?.requestHeaders?.['x-li-page-instance'];
  return idPart !== undefined
    ? `https://www.linkedin.com/sales/lead/${idPart}${lipiPartRaw ? '?lipi=' + encodeURIComponent(lipiPartRaw) : ''}`
    : undefined;
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function imageUrl(el: any): string | undefined {
  return el.profilePictureDisplayImage?.rootUrl !== undefined &&
    el.profilePictureDisplayImage?.artifacts?.[0]?.fileIdentifyingUrlPathSegment !== undefined
    ? `${el.profilePictureDisplayImage.rootUrl}${el.profilePictureDisplayImage.artifacts[0].fileIdentifyingUrlPathSegment}`
    : undefined;
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function toString(el?: any): string | undefined {
  return el === undefined || typeof el === 'string'
    ? el
    : typeof el === 'object'
      ? JSON.stringify(el)
      : typeof el['toString'] === 'function'
        ? el.toString()
        : `${el}`;
}

export const parserModelLinkedin: ParserConfig = {
  entities: {
    Lead: {
      fieldID: 'leadID',
      fields: {
        fullName: 'Full Name',
        firstName: 'First Name',
        lastName: 'Last Name',
        geoRegion: 'Location',
        company: 'Company',
        title: 'Title',
        summary: 'Summary',
        linkedinURL: { displayName: 'Browse in LinkedIn', type: 'url', browse: true },
        contactInfo: 'Contact Info',
        profilePictureDisplayImage: { type: 'image' },
        numOfConnections: 'Connections',
        numOfSharedConnections: 'Shared Connections',
        distance: 'Relationships',
        account: 'Account',
        accountRef: { entityRef: 'Account' },
        leadDetailsFetch: { type: 'url', fetch: true },
        leadDetailsBrowse: { displayName: 'Browse in SalesNav', type: 'url', browse: true },
      },
    } satisfies EntityTraits,
  },
  parsers: [
    {
      entity: 'Lead',
      urlMatcher: /linkedin.com\/sales-api\/salesApiPeopleSearch/i,
      extractor: (data: RecordedXHR): ValueRecord[] => {
        const responseObject = data.responseObject;
        const elements = responseObject.elements || [];
        return elements.map(
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          (el: any) =>
            ({
              fullName: toString(el?.fullName),
              firstName: toString(el?.firstName),
              lastName: toString(el?.lastName),
              geoRegion: toString(el?.geoRegion),
              company: toString(el?.currentPositions?.[0]?.companyName),
              title: toString(el?.currentPositions?.[0]?.title),
              profilePictureDisplayImage: { value: imageUrl(el) || '', altValue: toString(el?.fullName) || '' },
              distance: toString(el?.degree),
              account: toString(
                el?.leadAssociatedAccountResolutionResult?.name || el?.currentPositions?.[0]?.companyName,
              ),
              accountRef: toString(
                el?.leadAssociatedAccountResolutionResult?.entityUrn || el?.currentPositions?.[0]?.companyUrn,
              ),
              leadDetailsFetch: leadDetailsFetchURL(el),
              leadDetailsBrowse: {
                value: leadDetailsBrowseURL(el, data) || '',
                altValue: toString(el?.fullName) || '',
              },
              leadID: toString(el?.entityUrn),
            }) satisfies ValueRecord,
        );
      },
    },
    {
      entity: 'Lead',
      urlMatcher: /linkedin.com\/sales-api\/salesApiProfiles\//i,
      extractor: (data: RecordedXHR): ValueRecord[] => {
        const el = data.responseObject;
        return [
          {
            fullName: toString(el?.fullName),
            firstName: toString(el?.firstName),
            lastName: toString(el?.lastName),
            geoRegion: toString(el?.location),
            company: toString(el?.defaultPosition?.companyName),
            title: toString(el?.defaultPosition?.title) || toString(el?.headline),
            summary: toString(el?.summary) || '',
            linkedinURL: toString(el?.flagshipProfileUrl),
            contactInfo: JSON.stringify(el?.contactInfo),
            distance: toString(el?.degree),
            numOfConnections: toString(el?.numOfConnections || 0),
            numOfSharedConnections: toString(el?.numOfSharedConnections || 0),
            profilePictureDisplayImage: { value: imageUrl(el) || '', altValue: toString(el.fullName) || '' },
            leadDetailsBrowse: { value: leadDetailsBrowseURL(el, data) || '', altValue: toString(el.fullName) || '' },
            leadID: toString(el?.entityUrn),
          } satisfies ValueRecord,
        ];
      },
    },
  ],
};
