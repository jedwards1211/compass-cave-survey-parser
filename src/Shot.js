// @flow

import { Angle, Length, UnitizedNumber } from 'unitized'
import Trip from './Trip'

export type ShotProps = {|
  trip?: ?Trip,
  fromStationName: string,
  toStationName: string,
  length: UnitizedNumber<Length>,
  frontsightAzimuth?: ?UnitizedNumber<Angle>,
  frontsightInclination?: ?UnitizedNumber<Angle>,
  backsightAzimuth?: ?UnitizedNumber<Angle>,
  backsightInclination?: ?UnitizedNumber<Angle>,
  left?: ?UnitizedNumber<Length>,
  right?: ?UnitizedNumber<Length>,
  up?: ?UnitizedNumber<Length>,
  down?: ?UnitizedNumber<Length>,
  comment?: ?string,
  excludedFromLength?: ?boolean,
  excludedFromPlotting?: ?boolean,
  excludedFromAllProcessing?: ?boolean,
  doNotAdjust?: ?boolean,
|}

export default class Shot {
  trip: ?Trip
  fromStationName: string
  toStationName: string
  length: UnitizedNumber<Length>
  frontsightAzimuth: ?UnitizedNumber<Angle>
  frontsightInclination: ?UnitizedNumber<Angle>
  backsightAzimuth: ?UnitizedNumber<Angle>
  backsightInclination: ?UnitizedNumber<Angle>
  left: ?UnitizedNumber<Length>
  right: ?UnitizedNumber<Length>
  up: ?UnitizedNumber<Length>
  down: ?UnitizedNumber<Length>
  comment: ?string
  excludedFromLength: ?boolean
  excludedFromPlotting: ?boolean
  excludedFromAllProcessing: ?boolean
  doNotAdjust: ?boolean

  constructor(props: ShotProps) {
    Object.assign(this, props)
  }

  toString(): string {
    const {
      trip,
      fromStationName,
      toStationName,
      length,
      frontsightAzimuth,
      frontsightInclination,
      backsightAzimuth,
      backsightInclination,
      left,
      right,
      up,
      down,
      comment,
      excludedFromLength,
      excludedFromPlotting,
      excludedFromAllProcessing,
      doNotAdjust,
    } = this
    const flagsArray = [
      excludedFromLength,
      excludedFromPlotting,
      excludedFromAllProcessing,
      doNotAdjust,
    ]
    const flags = ['L', 'P', 'X', 'C'].filter((v, i) => flagsArray[i]).join('')
    const includeBacksights = trip
      ? trip.header.hasBacksights
      : backsightAzimuth != null || backsightInclination != null
    return ` ${fromStationName.padStart(11)} ${toStationName.padStart(
      12
    )} ${formatNumber(length)} ${formatNumber(
      frontsightAzimuth
    )} ${formatNumber(frontsightInclination)} ${formatNumber(
      left
    )} ${formatNumber(up)} ${formatNumber(down)} ${formatNumber(right)}${
      includeBacksights
        ? ` ${formatNumber(backsightAzimuth)} ${formatNumber(
            backsightInclination
          )}`
        : ''
    }   ${(flags ? ` #|${flags}#` : '').padEnd(6)} ${comment || ''}`.replace(
      /\s+$/,
      ''
    )
  }
}

function formatNumber(
  value: ?(number | UnitizedNumber<Length> | UnitizedNumber<Angle>)
): string {
  if (value == null) return formatNumber(-9999)
  if (value instanceof UnitizedNumber) {
    switch (value.unit.type) {
      case Length.type:
        return formatNumber((value: any).get(Length.feet))
      case Angle.type:
        return formatNumber((value: any).get(Angle.degrees))
      default:
        throw new Error(`invalid unit type: ${String(value.unit.type)}`)
    }
  } else if (typeof value === 'number') {
    return value.toFixed(2).padStart(8)
  } else {
    throw new Error(`invalid value: ${value}`)
  }
}
