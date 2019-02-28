// @flow
import CompassProjectDirective from './CompassProjectDirective'

export default class DatumDirective extends CompassProjectDirective {
  +datum: string

  constructor(datum: string) {
    super()
    this.datum = datum
  }

  toString(): string {
    return `&${this.datum};`
  }
}
