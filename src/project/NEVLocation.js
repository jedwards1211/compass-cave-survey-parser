// @flow

import { Length, UnitizedNumber } from 'unitized'

export type NEVLocation = {
  northing: UnitizedNumber<Length>,
  easting: UnitizedNumber<Length>,
  elevation: UnitizedNumber<Length>,
}
