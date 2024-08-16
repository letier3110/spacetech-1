## Description of the "Energy grid-planning" project

It is possible to locate optimal zones for solar/wind relative profitability/sustainability?

We can use satalite data for to create model, that can both plan and forecast the following: determine most effective areas for solar or wind generation, is it safe to build there, what grids are exist in the area to integrate with.

## Techical requirements

To get unprecise, but somewhat honest cost of solar panel construction per sq m, effectiveness, operation cost and revenue - we can combine these layers:

1. unchangable geo landscape layer 
  - just to know where it is possible to install (land, flat or at least sunny sides)
  - [optional] installement cost of leveling of the landscape
  - archive data of landscape required
2. changable weather layer (clouds/sun) 
  - to determine effectiveness of solar panel within the year
  - **actual space data required**
3. existing grid layer 
  - to determine logistical and infrastructural cost of operations
  - cadastre data or districts data required

to add sustainability (safety), one more layer with probabilistic destruction:

4. frontline distance:
  - linear gradient of probabilities from frontline. Hyper parameter tuning of gradient descent speed/acceleration
  - __possible space data__ (hard way) or other open data required (easier way)

5. rocket strikes per sq km per year 
  - linear gradient of probabilities from strike point. Hyper parameter tuning of gradient descent speed/acceleration
  - __possible space data__ (hard way) or other open data required (easier way)

to add political or community responsibility, add more layers:

6. districts layer 
  - by default limit by Slavutich district.
  - installements can be measured only within one disctrict due to political reasons of budgeting
  - use open data to determine maximum budget per district community, can be separate **layer**
  - cadastre data or districts data required

other layers to consider:

7. forestation layer
  - additional cost of operations and impact on ecology (consider long term ecology vs short term power need)
  - **actual space data required** or other green open data required

## Datasets per each layer

### 1. geo landscape layer
### 2. weather layer
### 3. existing electric grid layer


### 4. frontline distance layer

1. https://deepstatemap.live/
  - Exact frontline for current date, probably no need for historical data

### 5. rocket strikes layer

1. https://en.wikipedia.org/wiki/Russian_strikes_against_Ukrainian_infrastructure_(2022%E2%80%93present)
  - general info about where was the biggest strikes, unparsable
2. https://deepstatemap.live/
  - "Fires" map probably indicate where was the rocket strikes or shotdowns

### 6. districts layer

1. https://uk.wikipedia.org/wiki/%D0%A0%D0%B0%D0%B9%D0%BE%D0%BD%D0%B8_%D0%A3%D0%BA%D1%80%D0%B0%D1%97%D0%BD%D0%B8#/map/0
  - OSM, districts
  
### 7. forestattion layer