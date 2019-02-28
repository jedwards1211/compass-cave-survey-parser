/**
 * @flow
 * @prettier
 */

import { describe, it } from 'mocha'
import { expect } from 'chai'
import { Angle, Length } from 'unitized'
import { Segment, SegmentParser } from 'parse-segment'
import parseShots from '../../src/survey/parseShots'
import TripHeader from '../../src/survey/TripHeader'

describe(`parseShots`, function() {
  it(`works for basic shot`, function() {
    const header: TripHeader = new TripHeader({
      caveName: null,
      surveyName: null,
      date: new Date(),
      comment: null,
      surveyors: [],
      rawSurveyors: '?',
      declination: Angle.degrees.of(0),
      displayAzimuthUnit: 'degrees',
      displayLengthUnit: 'decimalFeet',
      displayLrudUnit: 'decimalFeet',
      displayInclinationUnit: 'degrees',
      lrudOrder: ['left', 'right', 'up', 'down'],
      shotMeasurementOrder: [
        'length',
        'frontsightAzimuth',
        'frontsightInclination',
      ],
      hasBacksights: false,
      lrudAssociation: 'from',
      lengthCorrection: Length.feet.of(0),
      frontsightAzimuthCorrection: Angle.degrees.of(0),
      frontsightInclinationCorrection: Angle.degrees.of(0),
    })

    expect(
      [
        ...parseShots(
          new SegmentParser(
            new Segment({
              value: ' A3 A4 4.25 15.00 -85.00 5.00 3.50 0.75 0.50',
              source: 'SURVEY.DAT',
            })
          ),
          header
        ),
      ][0]
    ).to.deep.equal({
      fromStationName: 'A3',
      toStationName: 'A4',
      length: Length.feet.of(4.25),
      frontsightAzimuth: Angle.degrees.of(15),
      frontsightInclination: Angle.degrees.of(-85),
      backsightAzimuth: null,
      backsightInclination: null,
      left: Length.feet.of(5),
      up: Length.feet.of(3.5),
      down: Length.feet.of(0.75),
      right: Length.feet.of(0.5),
    })
  })
  it(`works for shot with backsights`, function() {
    const header: TripHeader = new TripHeader({
      caveName: null,
      surveyName: null,
      date: new Date(),
      comment: null,
      surveyors: [],
      rawSurveyors: '?',
      declination: Angle.degrees.of(0),
      displayAzimuthUnit: 'degrees',
      displayLengthUnit: 'decimalFeet',
      displayLrudUnit: 'decimalFeet',
      displayInclinationUnit: 'degrees',
      lrudOrder: ['left', 'right', 'up', 'down'],
      shotMeasurementOrder: [
        'length',
        'frontsightAzimuth',
        'frontsightInclination',
      ],
      hasBacksights: true,
      lrudAssociation: 'from',
      lengthCorrection: Length.feet.of(0),
      frontsightAzimuthCorrection: Angle.degrees.of(0),
      frontsightInclinationCorrection: Angle.degrees.of(0),
    })

    expect(
      [
        ...parseShots(
          new SegmentParser(
            new Segment({
              value:
                ' A3 A4 4.25 15.00 -85.00 5.00 3.50 0.75 0.50 194.00 84.00 foo bar ',
              source: 'SURVEY.DAT',
            })
          ),
          header
        ),
      ][0]
    ).to.deep.equal({
      fromStationName: 'A3',
      toStationName: 'A4',
      length: Length.feet.of(4.25),
      frontsightAzimuth: Angle.degrees.of(15),
      frontsightInclination: Angle.degrees.of(-85),
      backsightAzimuth: Angle.degrees.of(194),
      backsightInclination: Angle.degrees.of(84),
      left: Length.feet.of(5),
      up: Length.feet.of(3.5),
      down: Length.feet.of(0.75),
      right: Length.feet.of(0.5),
      comment: 'foo bar',
    })
  })
  it(`parses shots until form feed`, function() {
    const header: TripHeader = new TripHeader({
      caveName: null,
      surveyName: null,
      date: new Date(),
      comment: null,
      surveyors: [],
      rawSurveyors: '?',
      declination: Angle.degrees.of(0),
      displayAzimuthUnit: 'degrees',
      displayLengthUnit: 'decimalFeet',
      displayLrudUnit: 'decimalFeet',
      displayInclinationUnit: 'degrees',
      lrudOrder: ['left', 'right', 'up', 'down'],
      shotMeasurementOrder: [
        'length',
        'frontsightAzimuth',
        'frontsightInclination',
      ],
      hasBacksights: false,
      lrudAssociation: 'from',
      lengthCorrection: Length.feet.of(0),
      frontsightAzimuthCorrection: Angle.degrees.of(0),
      frontsightInclinationCorrection: Angle.degrees.of(0),
    })

    expect([
      ...parseShots(
        new SegmentParser(
          new Segment({
            value: ` A3 A4 4.25 15.00 -85.00 5.00 3.50 0.75 0.50
A4 A5 3.85 -999.00 -90 1 2 -3 4 #|LC# test comment
\f
A4 A5 3.85 16.00 -2.32 1 2 3 4 test comment
`,
            source: 'SURVEY.DAT',
          })
        ),
        header
      ),
    ]).to.deep.equal([
      {
        fromStationName: 'A3',
        toStationName: 'A4',
        length: Length.feet.of(4.25),
        frontsightAzimuth: Angle.degrees.of(15),
        frontsightInclination: Angle.degrees.of(-85),
        backsightAzimuth: null,
        backsightInclination: null,
        left: Length.feet.of(5),
        up: Length.feet.of(3.5),
        down: Length.feet.of(0.75),
        right: Length.feet.of(0.5),
      },
      {
        fromStationName: 'A4',
        toStationName: 'A5',
        length: Length.feet.of(3.85),
        frontsightAzimuth: null,
        frontsightInclination: Angle.degrees.of(-90),
        backsightAzimuth: null,
        backsightInclination: null,
        left: Length.feet.of(1),
        up: Length.feet.of(2),
        down: null,
        right: Length.feet.of(4),
        comment: 'test comment',
        doNotAdjust: true,
        excludedFromLength: true,
      },
    ])
  })
})
