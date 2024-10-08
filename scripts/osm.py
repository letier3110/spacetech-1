# read data from '../data/rich/1.json' and write to '../data/rich/2.json'
# data is like this: 
# 1. inside json extract array of objects with address and area
# 2. query openstreetmap for latitude and longitude of each address
# 3. write to json file extended data with latitude and longitude
from typing import List

import requests
import json
import logging
import osmnx as ox
from osmnx._errors import InsufficientResponseError
from shapely.geometry import Polygon, MultiPolygon, Point
from shapely.ops import transform as shapely_transform
from pyproj import Proj, transform, Transformer

# Configure logging
logging.basicConfig(level=logging.DEBUG, format='%(asctime)s - %(levelname)s - %(message)s')


def get_lat_long(address):
    logging.debug(f"Querying latitude and longitude for address: {address}")
    url = 'https://nominatim.openstreetmap.org/search'
    # remove start of the string 'м.Славутич, ', change to 'Славутич, '
    address = address.replace('м.', '')
    params = {
        'q': address,
        'format': 'json'
    }
    headers = {
        'User-Agent': 'Spacetech/1.0'
    }
    response = requests.get(url, params=params, headers=headers)
    response.raise_for_status()  # Raise an error for bad status codes
    data = response.json()

    if data:
        logging.debug(f"Received data: {data[0]}")
        return data[0]['lat'], data[0]['lon']
    else:
        logging.debug("No data found for the address")
        return None, None


def get_building_polygon(lat: float, lon: float) -> List[Polygon]:
    # Define the point (latitude, longitude)
    point = (lat, lon)

    # Get the building footprint for the nearest building to the point
    try:
        buildings = ox.geometries_from_point(point, tags={'building': True}, dist=50)
    except InsufficientResponseError as e:
        logging.error(f"Failed to get building polygons for the point: {point}")
        logging.error(f"Error: {e}")
        return []

    if buildings.empty:
        return []

    # Create a Point object from the latitude and longitude
    point_geom = Point(lon, lat)

    # Extract the polygons of the buildings that contain the point
    polygons = []
    for geom in buildings.geometry:
        if isinstance(geom, Polygon) and geom.contains(point_geom):
            polygons.append(geom)
        elif isinstance(geom, MultiPolygon):
            for poly in geom:
                if poly.contains(point_geom):
                    polygons.append(poly)

    if not polygons:
        return []

    return polygons


def polygon_to_coordinates_list(polygon):
    # Extract the exterior coordinates of the polygon
    exterior_coords = list(polygon.exterior.coords)

    # Format the coordinates into the desired structure
    formatted_coords = [{"lt": f"{lat:.5f}", "lg": f"{lon:.5f}"} for lon, lat in exterior_coords]

    return formatted_coords


def get_area(polygons):
    area = 0
    for polygon in polygons:
        # Define the transformer (from WGS84 to UTM)
        transformer = Transformer.from_crs("epsg:4326", "epsg:32636", always_xy=True)

        # Project the polygon to the UTM coordinate system
        projected_polygon = shapely_transform(lambda x, y: transformer.transform(x, y), polygon)

        area += projected_polygon.area

    return area


def main():
    # Read data from '../data/rich/1.json'
    with open('../data/rich/1.json', 'r', encoding='utf-8') as f:
        json_data = json.load(f)
        logging.debug(f"Loaded JSON data: {json_data}")

    # Add latitude and longitude to each address
    for item in json_data:
        address = item['address']
        lat, lon = get_lat_long(address)
        # try to get latitude and longitude
        # try :
        #     lat, lon = get_lat_long(address)
        # except requests.exceptions.RequestException as e:
        #     logging.error(f"Failed to get latitude and longitude for address: {address}")
        #     logging.error(f"Error: {e}")
        #     lat = None
        #     lon = None
        if lat and lon:
            item['latitude'] = lat
            item['longitude'] = lon

            polygons = get_building_polygon(float(lat), float(lon))
            if polygons:
                item['polygons'] = [polygon.wkt for polygon in polygons]
                item['coordinates'] = [polygon_to_coordinates_list(polygon) for polygon in polygons]
                item['polygons_area'] = get_area(polygons)
            else:
                logging.debug("No building polygons found")
        else:
            item['latitude'] = 'Not found'
            item['longitude'] = 'Not found'

        logging.debug(f"Updated item: {item}")

    # Write the updated JSON data to '../data/rich/2.json'
    with open('../data/rich/2.json', 'w', encoding='utf-8') as f:
        json.dump(json_data, f, ensure_ascii=False, indent=4)
        logging.debug(f"Written updated JSON data to '../data/rich/2.json'")


if __name__ == "__main__":
    main()