/**
 * @flow
 * @prettier
 */

import { describe, it } from 'mocha'
import { expect } from 'chai'
import { Angle, Length } from 'unitized'
import Shot from '../../src/survey/Shot'

describe(`Shot.toString()`, function() {
  it(`works`, function() {
    expect(
      new Shot({
        fromStationName: 'A3',
        toStationName: 'A4',
        length: Length.feet.of(4.25),
        frontsightAzimuth: Angle.degrees.of(15),
        frontsightInclination: Angle.degrees.of(-85),
        backsightAzimuth: null,
        backsightInclination: null,
        left: Length.feet.of(5),
        up: null,
        down: Length.feet.of(0.75),
        right: Length.feet.of(0.5),
        excludedFromLength: true,
        doNotAdjust: true,
        comment: 'this is a test',
      }).toString()
    ).to.equal(
      '          A3           A4     4.25    15.00   -85.00     5.00 -9999.00     0.75     0.50    #|LC# this is a test'
    )
    expect(
      new Shot({
        fromStationName: 'A3',
        toStationName: 'A4',
        length: Length.feet.of(4.25),
        frontsightAzimuth: Angle.degrees.of(15),
        frontsightInclination: Angle.degrees.of(-85),
        backsightAzimuth: Angle.degrees.of(40),
        backsightInclination: null,
        left: Length.feet.of(5),
        up: null,
        down: Length.feet.of(0.75),
        right: Length.feet.of(0.5),
      }).toString()
    ).to.equal(
      '          A3           A4     4.25    15.00   -85.00     5.00 -9999.00     0.75     0.50    40.00 -9999.00'
    )
  })
})
