# read data from '../data/raw/1.ini' and write to '../data/rich/1.json'
# data is like this: 
# 1. find line that starts with 'м.Славутич, '
# 2. extract that line (=address) and line below it (=area)
# 3. remove duplicates with address as key
# 4. write to json file

import json
import logging
import sys

# Configure logging
logging.basicConfig(level=logging.DEBUG, format='%(asctime)s - %(levelname)s - %(message)s')

def extract_data(file_path, prefix='м.Славутич, '):
    logging.debug(f"Opening file for reading: {file_path}")
    with open(file_path, 'r') as file:
        lines = file.readlines()
        data = []
        address_set = set()
        for i, line in enumerate(lines):
            if line.startswith(prefix):
                logging.debug(f"Found address line: {line.strip()}")
                address = line.strip()
                if address in address_set:
                    logging.debug(f"Address already processed, skipping")
                    continue
                address_set.add(address)
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

# add arguments for prefix, get them from command line
def main():
    logging.debug("Starting ETL process")
    data = extract_data('../data/raw/1.ini', prefix=sys.argv[1])
    write_data(data, '../data/rich/1.json')
    logging.debug("ETL process completed")

if __name__ == "__main__":
    main()