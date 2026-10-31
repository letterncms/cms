/** Calendar geometry shared by rendering, queries and navigation preloading. */
const pad = (value: number) => String(value).padStart(2, '0')
export const calendarDayKey = (date: Date) => `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`

export function calendarRange(value?: string) {
  const month = /^\d{4}-(0[1-9]|1[0-2])$/.test(value ?? '') ? value! : calendarDayKey(new Date()).slice(0, 7)
  const year = Number(month.slice(0, 4)), monthIndex = Number(month.slice(5, 7)) - 1
  const first = new Date(year, monthIndex, 1)
  const start = new Date(year, monthIndex, 1 - ((first.getDay() + 6) % 7))
  const days = Array.from({ length: 42 }, (_, index) => new Date(start.getFullYear(), start.getMonth(), start.getDate() + index))
  const end = new Date(start.getFullYear(), start.getMonth(), start.getDate() + 42)
  return { month, year, monthIndex, first, start, end, days }
}
