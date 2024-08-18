import mapboxgl from 'mapbox-gl'
import { FC, useEffect, useMemo, useRef, useState } from 'react'
import { renderToString } from 'react-dom/server'
import ErrorBoundary from '../App/ErrorBoundary'
import { DataEntry } from '../../lib/interfaces'
import './mapbox.css'
import MiniCard from './MiniCard'

mapboxgl.accessToken = (import.meta.env.VITE_MAPBOX_ACCESS_TOKEN as string) || ''

const polygonTernary = true

const showPoiText = true
const showPoi = true
const showPolygonText = true
const showPolygon = true
const showPolygonExtrusion = false

interface MapProps {
  data: Array<DataEntry>
  lat: number
  lng: number
  zoom: number
}

const MapWrapper: FC<MapProps> = ({ data, lat, lng, zoom }) => {
  return (
    <div className='map-wrapper'>
      <ErrorBoundary fallback={'Cant Load Maps'}>
        <Map data={data} lat={lat} lng={lng} zoom={zoom} />
      </ErrorBoundary>
    </div>
  )
}

const buildingCoordinates = [
  [
    [30.76038, 51.52252],
    [30.75992, 51.52257],
    [30.75993, 51.5226],
    [30.75996, 51.52271],
    [30.75998, 51.52274],
    [30.76008, 51.52273],
    [30.7601, 51.52279],
    [30.76027, 51.52277],
    [30.76025, 51.52271],
    [30.76043, 51.52269],
    [30.76038, 51.52252]
  ]
]

const initialPoiData: GeoJSON.GeoJSON = {
  type: 'FeatureCollection',
  features: [
    {
      type: 'Feature',
      properties: {
        name: 'Test',
        description: 'test',
        effectiveness: 0.5,
        icon: 'music'
      },
      geometry: {
        type: 'Polygon',
        coordinates: buildingCoordinates
      }
    }
  ]
}

const Map: FC<MapProps> = ({ data, lat, lng, zoom }) => {
  const mapContainer = useRef<HTMLDivElement>(null)
  const map = useRef<mapboxgl.Map | null>(null)
  const prevData = useRef<Array<DataEntry>>([])

  const [mode, setMode] = useState<string>(
    window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light'
  )

  useEffect(() => {
    window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', (event) => {
      const colorScheme = event.matches ? 'dark' : 'light'
      setMode(colorScheme)
    })
  }, [])

  useEffect(() => {
    if (map.current) {
      map.current.flyTo({
        center: [lng, lat],
        zoom: zoom
      })
    }
  }, [lat, lng, zoom])

  const poiData: GeoJSON.GeoJSON = useMemo(() => {
    return {
      type: 'FeatureCollection',
      features: initialPoiData.features.concat(
        data.map<GeoJSON.Feature>((card, index) => {
          // const isPolygon = card.coordinates && card.coordinates.length > 2
          const isPolygon = card.coordinates && card.coordinates.length > 0
          const dotGeomentry = {
            type: 'Point' as GeoJSON.Point['type'],
            coordinates: [Number.parseFloat(card.longitude), Number.parseFloat(card.latitude)]
          }
          const polygonCoords = (card.coordinates ?? [[]]).map((x) => {
            const coords = x.map((y) => {
              const coord = [Number.parseFloat(y.lg), Number.parseFloat(y.lt)]
              // console.log(coord)
              return coord
            })
            // console.log(coords)
            return coords
          })
          // console.log(JSON.stringify(polygonCoords))
          const polygonGeomentry = {
            type: 'Polygon' as GeoJSON.Polygon['type'],
            coordinates: polygonCoords
          }
          return {
            type: 'Feature',
            properties: {
              ...card,
              color: card.color,
              originalIndex: index,
              name: card.address,
              description: card.area,
              icon: 'music'
            },
            geometry: isPolygon && polygonTernary ? polygonGeomentry : dotGeomentry
            // geometry: dotGeomentry
          }
        })
      )
    }
  }, [data])
  useEffect(() => {
    if (map.current) {
      // if map loaded && data changed
      if (prevData.current.every((card, index) => card === data[index]) && prevData.current.length === data.length) {
        return
      }
      if (
        map.current.getSource('poi-source') &&
        map.current.getLayer('poi-layer') &&
        map.current.getSource('polygon-source') &&
        map.current.getLayer('polygon-layer')
      ) {
        // old code to re-render on appearance change
        return
      }
      return
    } // initialize map only once
    // create map once, then "fly" to new locations
    map.current = new mapboxgl.Map({
      container: mapContainer.current as never, // container ID
      // traffic v12
      style: `mapbox://styles/mapbox/${mode}-v11`, // style URL
      // center: [-8.6291, 41.1579], // Porto coordinates
      // zoom: 13,
      center: [lng, lat],
      zoom: zoom,
      // pitch: 60,
      // bearing: -60,
      dragRotate: false,
      touchZoomRotate: false,
      localFontFamily: 'Pangea Display,Helvetica,Arial,sans-serif'
    })
    if (map.current) {
      map.current.on('load', () => {
        if (!map.current) return
        // const onlyWithEffectiveness = poiData.features.filter((x) => x.properties?.effectiveness)
        // const min = Math.min(...onlyWithEffectiveness.map((x) => x.properties?.effectiveness))
        // const max = Math.max(...onlyWithEffectiveness.map((x) => x.properties?.effectiveness))
        window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', (event) => {
          if (!map.current) return
          const colorScheme = event.matches ? 'dark' : 'light'
          map.current.setStyle(`mapbox://styles/mapbox/${colorScheme}-v11`)
        })
        map.current.addControl(new mapboxgl.NavigationControl())
        map.current.addControl(new mapboxgl.FullscreenControl())
        map.current.addControl(
          new mapboxgl.GeolocateControl({
            positionOptions: {
              enableHighAccuracy: true
            },
            trackUserLocation: true
          })
        )
        const points = {
          ...poiData,
          features: poiData.features.filter((x) => x.geometry.type === 'Point')
        }
        const polygons = {
          ...poiData,
          features: poiData.features.filter((x) => x.geometry.type === 'Polygon')
        }

        prevData.current = data
        map.current.addSource('pois', {
          type: 'geojson',
          data: points
        })
        map.current.addSource('pss', {
          type: 'geojson',
          data: polygons
        })

        if (showPoiText) {
          map.current.addLayer({
            id: 'poi-layer-text',
            source: 'pois',
            type: 'symbol',
            layout: {
              'text-field': ['get', 'originalIndex'],
              'text-variable-anchor': ['top', 'bottom', 'left', 'right'],
              'text-radial-offset': 0.5,
              'text-justify': 'auto'
            },
            paint: {
              'text-color': mode === 'dark' ? '#fff' : '#000'
            }
          })
        }

        if (showPoi) {
          map.current.addLayer({
            id: 'poi-layer',
            source: 'pois',
            type: 'circle',
            paint: {
              'circle-radius': 6,
              'circle-color': ['get', 'color']
              // 'circle-color': [
              //   'interpolate',
              //   ['linear'],
              //   ['get', 'effectiveness'], // Access the 'effectiveness' property from your source
              //   min,
              //   'red', // Minimum slope value, color red
              //   max,
              //   'green' // Maximum slope value, color green
              // ]
            }
          })
        }

        if (!showPolygonExtrusion && showPolygon) {
          map.current
            .addLayer({
              id: 'polygon-layer',
              source: 'pss',
              // type: 'circle',
              // paint: {
              //   'circle-radius': 6,
              //   'circle-color': ['get', 'color']
              // }
              type: 'fill',
              layout: {},
              paint: {
                'fill-color': ['get', 'color'],
                // 'fill-color': [
                //   'interpolate',
                //   ['exponential', 0.01],
                //   ['get', 'effectiveness'], // Access the 'effectiveness' property from your source
                //   min,
                //   'red', // Minimum slope value, color red
                //   max,
                //   'green' // Maximum slope value, color green
                // ],
                'fill-opacity': 0.765
              }
            })
            // Add a black outline around the polygon.
            .addLayer({
              id: 'polygon-outline',
              type: 'line',
              source: 'pss',
              layout: {},
              paint: {
                'line-color': '#000',
                'line-width': 1
              }
            })
        }

        if (!showPolygon && showPolygonExtrusion) {
          map.current.addLayer({
            id: 'polygon-layer',
            source: 'pss',
            type: 'fill-extrusion',
            paint: {
              'fill-extrusion-color': ['get', 'color'],

              // Get `fill-extrusion-height` from the source `height` property.
              'fill-extrusion-height': 1,

              // Get `fill-extrusion-base` from the source `base_height` property.
              'fill-extrusion-base': 1,

              // Make extrusions slightly opaque to see through indoor walls.
              'fill-extrusion-opacity': 0.5
            }
          })
        }
        if (showPolygonText) {
          map.current.addLayer({
            id: 'polygon-layer-text',
            source: 'pss',
            type: 'symbol',
            layout: {
              'text-field': ['get', 'originalIndex'],
              'text-variable-anchor': ['top', 'bottom', 'left', 'right'],
              'text-radial-offset': 0.5,
              'text-justify': 'auto'
            },
            paint: {
              'text-color': mode === 'dark' ? '#aff' : '#000'
            }
          })
        }

        // const hoveredStateId: number | null = null

        // map.current.on('mousemove', 'poi-layer', (e) => {
        //   if (!map.current) return
        //   if (e.features.length > 0) {
        //     if (hoveredStateId !== null) {
        //       map.current.setFeatureState(
        //         { source: 'poi-source', id: hoveredStateId },
        //         { hover: false }
        //       )
        //     }
        //     hoveredStateId = e.features[0].id
        //     map.current.setFeatureState(
        //       { source: 'poi-source', id: hoveredStateId || 0 },
        //       { hover: true }
        //     )
        //   }
        // })

        // map.current.on('mouseleave', 'poi-layer', () => {
        //   if (!map.current) return
        //   if (hoveredStateId !== null) {
        //     map.current.setFeatureState(
        //       { source: 'poi-source', id: hoveredStateId },
        //       { hover: false }
        //     )
        //   }
        //   hoveredStateId = null
        // })

        // Add click event for POIs
        map.current.on('click', 'poi-layer', (e) => {
          if (!map.current) return
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          const coordinates = (e?.features?.[0].geometry as any).coordinates.slice()
          // console.log(coordinates)
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          const plainProperties = e?.features?.[0].properties as any

          // // TODO: get from Minicard
          const component = MiniCard({
            cardData: {
              // originalIndex: 0,
              area: plainProperties.area,
              mediaUrl: plainProperties.mediaUrl ? JSON.parse(plainProperties.mediaUrl) : undefined,
              effectiveness: plainProperties.effectiveness,
              address: plainProperties.address,
              latitude: coordinates[1],
              longitude: coordinates[0]
            }
          })
          const template = renderToString(component)

          if (!template) return

          new mapboxgl.Popup({
            className: 'poi-popup'
          })
            .setLngLat(coordinates)
            .setHTML(template)
            .addTo(map.current)
        })

        map.current.on('click', 'polygon-layer', (e) => {
          if (!map.current) return

          // const coordinates = (e?.features?.[0].properties as any).coordinates.slice()
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          const plainProperties = e?.features?.[0].properties as any
          const coordinates = [
            Number.parseFloat(plainProperties.longitude),
            Number.parseFloat(plainProperties.latitude)
          ]

          // // TODO: get from Minicard
          const component = MiniCard({
            cardData: {
              // originalIndex: 0,
              area: plainProperties.area,
              mediaUrl: plainProperties.mediaUrl ? JSON.parse(plainProperties.mediaUrl) : undefined,
              effectiveness: plainProperties.effectiveness,
              address: plainProperties.address,
              latitude: `${coordinates[1]}`,
              longitude: `${coordinates[0]}`
            }
          })
          const template = renderToString(component)

          if (!template) return

          new mapboxgl.Popup({
            className: 'poi-popup'
          })
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            .setLngLat(coordinates as any)
            .setHTML(template)
            .addTo(map.current)
        })

        // Change cursor on POI hover
        map.current.on('mouseenter', 'poi-layer', () => {
          if (!map.current) return
          map.current.getCanvas().style.cursor = 'pointer'
        })
        map.current.on('mouseleave', 'poi-layer', () => {
          if (!map.current) return
          map.current.getCanvas().style.cursor = ''
        })
        // console.log(map.current)
      })
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [poiData])

  return <div ref={mapContainer} id='map' style={{ width: '100%', height: '100%' }}></div>
}

export default MapWrapper
