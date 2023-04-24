// Event name splitter functions
const splitter = /(^|:)(\w)/gi
const getEventName = (_m: string, _pre: string, eventName: string) =>
  eventName.toUpperCase()

export const getEventMethodName = (event: string) =>
  `on${event.replace(splitter, getEventName)}`
