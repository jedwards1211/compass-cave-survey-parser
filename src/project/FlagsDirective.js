// @flow
import CompassProjectDirective from './CompassProjectDirective'

export default class FlagsDirective extends CompassProjectDirective {
  +flags: number

  static +OVERRIDE_LRUDS: number = 0x1
  static +LRUDS_AT_TO_STATION: number = 0x2

  constructor(flags: number) {
    super()
    this.flags = flags
  }

  isOverrideLruds(): boolean {
    return (this.flags & FlagsDirective.OVERRIDE_LRUDS) !== 0
  }

  isLrudsAtToStation(): boolean {
    return (this.flags & FlagsDirective.LRUDS_AT_TO_STATION) !== 0
  }

  toString(): string {
    return `!${this.isOverrideLruds() ? 'O' : 'o'}${
      this.isLrudsAtToStation() ? 'T' : 't'
    };`
  }
}
