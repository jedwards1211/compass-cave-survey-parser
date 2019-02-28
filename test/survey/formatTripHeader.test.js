/**
 * @flow
 * @prettier
 */

import { describe, it } from 'mocha'
import { expect } from 'chai'

import { Angle, Length } from 'unitized'
import TripHeader from '../../src/survey/TripHeader'

describe(`TripHeader.toString()`, function() {
  it(`works`, function() {
    expect(
      new TripHeader({
        caveName: 'SECRET CAVE',
        surveyName: 'A',
        date: new Date('1979/7/10'),
        comment: 'Entrance Passage',
        surveyors: ['D.SMITH', 'R.BROWN', 'S.MURRAY'],
        rawSurveyors: 'D.SMITH,R.BROWN,S.MURRAY',
        declination: Angle.degrees.of(1),
        displayAzimuthUnit: 'degrees',
        displayLengthUnit: 'decimalFeet',
        displayLrudUnit: 'decimalFeet',
        displayInclinationUnit: 'degrees',
        lrudOrder: ['left', 'up', 'down', 'right'],
        shotMeasurementOrder: [
          'frontsightAzimuth',
          'frontsightInclination',
          'length',
          'backsightAzimuth',
          'backsightInclination',
        ],
        hasBacksights: true,
        lrudAssociation: 'from',
        lengthCorrection: Length.feet.of(4),
        frontsightAzimuthCorrection: Angle.degrees.of(2),
        frontsightInclinationCorrection: Angle.degrees.of(3),
        backsightAzimuthCorrection: Angle.degrees.of(5),
        backsightInclinationCorrection: Angle.degrees.of(6),
      }).toString()
    ).to.equal(`SECRET CAVE
SURVEY NAME: A
SURVEY DATE: 7 10 1979  COMMENT:Entrance Passage
SURVEY TEAM:
D.SMITH,R.BROWN,S.MURRAY
DECLINATION:    1.00  FORMAT: DDDDLUDRADLadBF  CORRECTIONS: 2.00 3.00 4.00  CORRECTIONS2: 5.00 6.00
`)
  })
})
