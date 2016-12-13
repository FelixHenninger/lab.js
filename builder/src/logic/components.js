export const metadata = {
  'lab.flow.Sequence': {
    name: 'Sequence',
    category: 'Flow',
    minChildren: 1,
    maxChildren: Infinity,
    defaults: {
      type: 'lab.flow.Sequence',
      children: [],
    }
  },
  'lab.html.Screen': {
    name: 'Screen',
    category: 'HTML',
    minChildren: 0,
    maxChildren: 0,
    defaults: {
      type: 'lab.html.Screen',
    }
  },
}
