const defaultState = {
  // root
  'root': {
    id: 'root',
    title: 'root',
    type: 'lab.flow.Sequence',
    children: ['Experiment']
  },
  'Experiment': {
    id: 'Experiment',
    title: 'Experiment',
    type: 'lab.flow.Sequence',
    children: ['Instruction']
  },
  'Instruction': {
    id: 'Instruction',
    title: 'Instruction',
    type: 'lab.html.Screen',
    content: 'This is some content',
  },
}

export default (state=defaultState, action) =>
  state
