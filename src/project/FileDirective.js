// @flow
import CompassProjectDirective from './CompassProjectDirective'

import { type LinkStation } from './LInkStation'

import { type NEVLocation } from './NEVLocation'

import { Length } from 'unitized'

export default class FileDirective extends CompassProjectDirective {
  +file: string
  +linkStations: Array<LinkStation>

  constructor(file: string, linkStations?: ?Array<LinkStation>) {
    super()
    this.file = file
    this.linkStations = linkStations || []
  }

  toString(): string {
    const { file, linkStations } = this
    if (!linkStations.length) return `#${file};`
    return `#${file},\r\n ${linkStations
      .map(
        ({ name, location }) =>
          `${name}${location ? formatLocation(location) : ''}`
      )
      .join(',\r\n ')};`
  }
}

function formatLocation({ easting, northing, elevation }: NEVLocation): string {
  let { unit } = easting
  if (Length.feet !== unit) unit = Length.meters
  return `[${Length.feet === unit ? 'f' : 'm'},${easting
    .get(unit)
    .toFixed(2)},${northing.get(unit).toFixed(2)},${elevation
    .get(unit)
    .toFixed(2)}]`
}
