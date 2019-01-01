import { saveAs } from 'file-saver'
import parseAuthor from 'parse-author'

const makeCreator = metadata =>
  metadata.contributors
    .split('\n')
    .map(c => parseAuthor(c))
    .filter(c => c.name && c.name !== '')
    .map(c => ({
      '@type': 'Person',
      ...c, // add whatever data we have
    }))

const defaultVariables = [
  {
    '@type': 'PropertyValue',
    'name': 'sender',
    'description': 'Name of component or screen in the study that generated the current data row',
  },
  {
    '@type': 'PropertyValue',
    'name': 'sender_type',
    'description': 'Type of component that generated the current data row',
  },
  {
    '@type': 'PropertyValue',
    'name': 'sender_id',
    'description': 'Position of component in the study hierarchy',
  },
  {
    '@type': 'PropertyValue',
    'name': 'timestamp',
    'description': 'Time and date of data storage',
  },
  {
    '@type': 'PropertyValue',
    'name': 'meta',
    'description': 'Technical browser metadata',
  },
  {
    '@type': 'PropertyValue',
    'name': 'correct',
    'description': 'Response veracity',
  },
  {
    '@type': 'PropertyValue',
    'name': 'duration',
    'description': 'Component presentation duration',
    'unitCode': 'C26',
    'unitText': 'milliseconds',
    'minValue': 0,
  },
  {
    '@type': 'PropertyValue',
    'name': 'ended_on',
    'description': 'Reason for component end',
    'levels': ['response', 'timeout', 'skipped'],
  },
  {
    '@type': 'PropertyValue',
    'name': 'response',
    'description': 'Participant response',
  },
  {
    '@type': 'PropertyValue',
    'name': 'time_commit',
    'description': 'Timestamp of data logging',
    'unitCode': 'C26',
    'unitText': 'milliseconds',
    'minValue': 0,
  },
  {
    '@type': 'PropertyValue',
    'name': 'time_end',
    'description': 'Frame timestamp at which component presentation ended',
    'unitCode': 'C26',
    'unitText': 'milliseconds',
    'minValue': 0,
  },
  {
    '@type': 'PropertyValue',
    'name': 'time_render',
    'description': 'Frame timestamp at which component was rendered',
    'unitCode': 'C26',
    'unitText': 'milliseconds',
    'minValue': 0,
  },
  {
    '@type': 'PropertyValue',
    'name': 'time_run',
    'description': 'Timestamp at which component was initialized',
    'unitCode': 'C26',
    'unitText': 'milliseconds',
    'minValue': 0,
  },
  {
    '@type': 'PropertyValue',
    'name': 'time_show',
    'description': 'Frame timestamp at which component was shown on screen',
    'unitCode': 'C26',
    'unitText': 'milliseconds',
    'minValue': 0,
  },
  {
    '@type': 'PropertyValue',
    'name': 'time_switch',
    'description': 'Frame timestamp at which the next component was shown',
    'unitCode': 'C26',
    'unitText': 'milliseconds',
    'minValue': 0,
  },
  {
    '@type': 'PropertyValue',
    'name': 'url',
    'description': 'Page URL from which study was loaded',
  },
]

/*
  {
    '@type': 'PropertyValue',
    'name': 'Template',
    'description': '',
    'unitCode': '',
    'unitText': '',
    'levels': [],
    'minValue': 0,
    'naValues': [],
  },
*/

const makeVariables = state => {
  // Only return predefined set of default variables for now
  return defaultVariables
}

const makeMetadata = state => {
  const metadata = state.components['root'].metadata

  return {
    '@context': 'http://schema.org',
    '@type': 'Dataset',
    'schemaVersion': 'Psych-DS 0.1.0',
    'name': `${ metadata.title || 'Study' } dataset`,
    'description': metadata.description,
    'creator': makeCreator(metadata),
    'variableMeasured': makeVariables(state),
  }
}

export const makeSidecar = state =>
  JSON.stringify(
    makeMetadata(state),
    null, 2
  )

export const downloadSidecar = state => {
  const payload = new Blob(
    [ makeSidecar(state) ],
    { type: 'application/ld+json;charset=utf-8' }
  )

  // NOTE: Right now, we use the most generic file name.
  // However, there are multiple plausible alternatives:
  // - `${ makeFilename(state) }_data.json`
  //   (to match individual data files)
  // - `dataset_description-${ makeFilename(state) }.json`
  //   (to retain a link to the specific study)
  const filename = 'dataset_description.json'
  return saveAs(payload, filename)
}
