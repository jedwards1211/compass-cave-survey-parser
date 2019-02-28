// @flow
import CompassProjectDirective from './CompassProjectDirective'

export default class UTMZoneDirective extends CompassProjectDirective {
  +utmZone: number

  constructor(utmZone: number) {
    super()
    if (utmZone < 1 || utmZone > 60) {
      throw new Error(`invalid UTM Zone: ${utmZone}`)
    }
    this.utmZone = utmZone
  }

  toString(): string {
    return `$${this.utmZone};`
  }
}
