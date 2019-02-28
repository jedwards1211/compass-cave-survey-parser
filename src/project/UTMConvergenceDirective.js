// @flow
import CompassProjectDirective from './CompassProjectDirective'

import { Angle, UnitizedNumber } from 'unitized'
import { formatNumber } from './LocationDirective'

export default class UTMConvergenceDirective extends CompassProjectDirective {
  +utmConvergence: UnitizedNumber<Angle>

  constructor(utmConvergence: UnitizedNumber<Angle>) {
    super()
    this.utmConvergence = utmConvergence
  }

  toString(): string {
    return `%${formatNumber(this.utmConvergence)};`
  }
}
