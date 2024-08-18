# read data from './raw/1.ini' and write to './rich/1.json'
# data is like this: 
# 1. find line that starts with 'м.Славутич, '
# 2. extract that line (=address) and line below it (=area)
# 3. write to json file

import json
import logging

# Configure logging
logging.basicConfig(level=logging.DEBUG, format='%(asctime)s - %(levelname)s - %(message)s')

def extract_data(file_path):
    logging.debug(f"Opening file for reading: {file_path}")
    with open(file_path, 'r') as file:
        lines = file.readlines()
        data = []
        for i, line in enumerate(lines):
            if line.startswith('м.Славутич, '):
                logging.debug(f"Found address line: {line.strip()}")
                address = line.strip()
                area = lines[i+1].strip()
                logging.debug(f"Extracted area line: {area}")
                data.append({
                    'address': address,
                    'area': area
                })
    logging.debug(f"Extracted data: {data}")
    return data

def write_data(data, file_path):
    logging.debug(f"Opening file for writing: {file_path}")
    with open(file_path, 'w') as file:
        json.dump(data, file, ensure_ascii=False, indent=4)
    logging.debug(f"Data written to file: {file_path}")

def main():
    logging.debug("Starting ETL process")
    data = extract_data('./raw/1.ini')
    write_data(data, './rich/1.json')
    logging.debug("ETL process completed")

if __name__ == "__main__":
    main()