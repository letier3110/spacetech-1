export type CoordItem = [string, string]

export type CoordObj = {
  lt: string
  lg: string
}

export interface DataEntry {
  originalIndex?: number
  address: string
  area: string
  latitude: string
  longitude: string
  coordinates?: Array<Array<CoordObj>>
  color?: string
  shortName?: string
  // coordinates?: Array<CoordItem>
  slope?: string
  effectiveness?: string
  // remove this, legacy
  mediaUrl?: string[]
  gmaps?: string
}
