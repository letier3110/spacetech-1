// linear interpolate between two values
export const generateColor = (value: number, min: number, max: number): string => {
  const percentage = (value - min) / (max - min)
  const hue = ((percentage) * 120).toString(10)
  return `hsl(${hue}, 50%, 50%)`
}