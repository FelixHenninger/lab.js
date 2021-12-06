const twoDigit = (x: number) => x.toString().padStart(2, '0')

export const dateString = (d = new Date()) =>
  `${d.getFullYear()}-` +
  `${twoDigit(d.getMonth() + 1)}-` +
  `${twoDigit(d.getDate())}--` +
  `${d.toTimeString().split(' ')[0]}`
