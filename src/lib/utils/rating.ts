export function getStarColor(condition: number): string {
  if (condition >= 9) return "fill-green-500 stroke-green-500"
  if (condition >= 7) return "fill-yellow-500 stroke-yellow-500"
  return "fill-red-500 stroke-red-500"
}
