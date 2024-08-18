export interface DataEntry {
  originalIndex?: number
  address: string
  area: string
  latitude: string
  longitude: string
  slope?: string
  effectiveness?: string
  // remove this, legacy
  mediaUrl?: string[]
  gmaps?: string
}
