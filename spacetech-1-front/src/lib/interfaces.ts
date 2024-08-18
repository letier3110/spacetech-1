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
  solar_kit?: SolarKit
  // coordinates?: Array<CoordItem>
  slope?: string
  effectiveness?: string
  // remove this, legacy
  mediaUrl?: string[]
  gmaps?: string
}

// coordinates: [[[[1, 2], [3, 4]]]]
// type": "MultiPolygon",
//         "cadnum": "3211500000:00:018:0022",
//         "area": "4.6495",
//         "unit_area": "га",
//         "address"
export interface CadastrEntry {
  // actual data
  type: string
  cadnum: string
  area: string
  unit_area: string
  address: string | null
  coordinates: Array<Array<Array<number>>>
  effectiveness?: number
  solar_kit?: SolarKit

  // needed for rendering
  color?: string
  originalIndex?: number
  shortName?: string
}

export interface SolarKit {
  effectiveness_weight: number
  name: string
  total_power: string
  number_of_panels: number
  min_roof_area: string
  warranty_period: string
  price: string
  income_per_year: string
  payback_period: string
  count: number
  cost: number
}