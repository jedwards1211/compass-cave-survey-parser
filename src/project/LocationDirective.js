// @flow
import CompassProjectDirective from './CompassProjectDirective'

import { Angle, Length, UnitizedNumber } from 'unitized'

export default class LocationDirective extends CompassProjectDirective {
  +easting: UnitizedNumber<Length>
  +northing: UnitizedNumber<Length>
  +elevation: UnitizedNumber<Length>
  +utmZone: number
  +utmConvergence: UnitizedNumber<Angle>

  constructor({
    easting,
    northing,
    elevation,
    utmZone,
    utmConvergence,
  }: {
    easting: UnitizedNumber<Length>,
    northing: UnitizedNumber<Length>,
    elevation: UnitizedNumber<Length>,
    utmZone: number,
    utmConvergence: UnitizedNumber<Angle>,
  }) {
    super()
    this.easting = easting
    this.northing = northing
    this.elevation = elevation
    this.utmZone = utmZone
    this.utmConvergence = utmConvergence
  }

  toString(): string {
    const { easting, northing, elevation, utmZone, utmConvergence } = this
    return `@${formatNumber(easting)},${formatNumber(northing)},${formatNumber(
      elevation
    )},${utmZone},${formatNumber(utmConvergence)};`
  }
}

export function formatNumber(
  value: number | UnitizedNumber<Length> | UnitizedNumber<Angle>
): string {
  if (value instanceof UnitizedNumber) {
    switch (value.unit.type) {
      case Length.type:
        return formatNumber((value: any).get(Length.meters))
      case Angle.type:
        return formatNumber((value: any).get(Angle.degrees))
      default:
        throw new Error(`invalid unit type: ${String(value.unit.type)}`)
    }
  } else if (typeof value === 'number') {
    return value.toFixed(3)
  } else {
    throw new Error(`invalid value: ${value}`)
  }
}
