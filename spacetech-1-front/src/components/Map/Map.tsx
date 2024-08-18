import mapboxgl from 'mapbox-gl'
import { FC, useEffect, useMemo, useRef, useState } from 'react'
import { renderToString } from 'react-dom/server'
import ErrorBoundary from '../App/ErrorBoundary'
import { DataEntry } from '../../lib/interfaces'
import './mapbox.css'
import MiniCard from './MiniCard'

mapboxgl.accessToken = (import.meta.env.VITE_MAPBOX_ACCESS_TOKEN as string) || ''

const polygonTernary = false

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
  [51.52252001, 30.7603801],
  [51.52257001, 30.7599201],
  [51.52260001, 30.7599301],
  [51.52271001, 30.7599601],
  [51.52274001, 30.7599801],
  [51.52273001, 30.7600801],
  [51.52279001, 30.7601001],
  [51.52277001, 30.7602701],
  [51.52271001, 30.7602501],
  [51.52269001, 30.7604301],
  [51.52252001, 30.7603801]
]

const initialPoiData: GeoJSON.GeoJSON = {
  type: 'FeatureCollection',
  features: [
    {
      type: 'Feature',
      properties: {
        name: 'Building',
        description: 'Building',
        color: '#646cff',
        icon: 'music'
      },
      geometry: {
        type: 'Polygon',
        coordinates: [buildingCoordinates]
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
      features: initialPoiData.features
      .concat(
        data.map<GeoJSON.Feature>((card) => {
          // const isPolygon = card.coordinates && card.coordinates.length > 2
          const isPolygon = card.coordinates && card.coordinates.length > 0
          const dotGeomentry = {
            type: 'Point' as GeoJSON.Point['type'],
            coordinates: [Number.parseFloat(card.longitude), Number.parseFloat(card.latitude)]
          }
          const polygonCoords = (card.coordinates ?? [[]]).map((x) => {
            const coords = x.map((y) => {
              const coord = [Number.parseFloat(y.lt), Number.parseFloat(y.lg)]
              return coord
            })
            return coords
          })
          const polygonGeomentry = {
            type: 'Polygon' as GeoJSON.Polygon['type'],
            coordinates: polygonCoords
          }
          return {
            type: 'Feature',
            properties: {
              ...card,
              name: card.address,
              description: card.area,
              color: '#646cff',
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

        console.log(points, polygons)

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
              'text-field': ['get', 'description'],
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
            }
          })
        }

        if (!showPolygonExtrusion && showPolygon) {
          map.current.addLayer({
            id: 'polygon-layer',
            source: 'pss',
            // type: 'circle',
            // paint: {
            //   'circle-radius': 6,
            //   'circle-color': ['get', 'color']
            // }
            type: 'fill',
            'layout': {},
            paint: {
              'fill-color': ['get', 'color'],
              'fill-opacity': 0.8
            }
          })
          // Add a black outline around the polygon.
          .addLayer({
              'id': 'polygon-outline',
              'type': 'line',
              'source': 'pss',
              'layout': {},
              'paint': {
                  'line-color': '#000',
                  'line-width': 3
              }
          });
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
              'text-field': ['get', 'description'],
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
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          const plainProperties = e?.features?.[0].properties as any

          // // TODO: get from Minicard
          const component = MiniCard({
            cardData: {
              // originalIndex: 0,
              area: plainProperties.area,
              mediaUrl: plainProperties.mediaUrl ? JSON.parse(plainProperties.mediaUrl) : undefined,
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
