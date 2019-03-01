/**
 * @flow
 * @prettier
 */

import { describe, it } from 'mocha'
import { expect } from 'chai'
import { Segment, SegmentParser, SegmentParseError } from 'parse-segment'
import { Length, Angle } from 'unitized'
import parseTripHeader from '../../src/survey/parseTripHeader'
import TripHeader from '../../src/survey/TripHeader'

describe(`parseTripHeader`, function() {
  it(`throws if SURVEY NAME: is missing`, function() {
    const parser = new SegmentParser(
      new Segment({
        value: `SECRET CAVE
SURVEY DATE: 7 10 79  COMMENT:Entrance Passage
`,
        source: 'SECRET.DAT',
      })
    )
    expect(() => parseTripHeader(parser)).to.throw(
      SegmentParseError,
      `expected SURVEY NAME: (SECRET.DAT, line 2, col 1)
SURVEY DATE: 7 10 79  COMMENT:Entrance Passage
^`
    )
  })
  it(`throws if SURVEY DATE: is missing`, function() {
    const parser = new SegmentParser(
      new Segment({
        value: `SECRET CAVE
SURVEY NAME: A
SURVEY TEAM:
D.SMITH,R.BROWN,S.MURRAY
`,
        source: 'SECRET.DAT',
      })
    )
    expect(() => parseTripHeader(parser)).to.throw(
      SegmentParseError,
      `expected SURVEY DATE: (SECRET.DAT, line 3, col 1)
SURVEY TEAM:
^`
    )
  })
  it(`throws if month is invalid`, function() {
    const parser = new SegmentParser(
      new Segment({
        value: `SECRET CAVE
SURVEY NAME: A
SURVEY DATE: 1a 5 14
`,
        source: 'SECRET.DAT',
      })
    )
    expect(() => parseTripHeader(parser)).to.throw(
      SegmentParseError,
      `invalid month (SECRET.DAT, line 3, col 14)
SURVEY DATE: 1a 5 14
             ^^`
    )
  })
  it(`throws if month is out of range`, function() {
    const parser = new SegmentParser(
      new Segment({
        value: `SECRET CAVE
SURVEY NAME: A
SURVEY DATE: 13 5 14
`,
        source: 'SECRET.DAT',
      })
    )
    expect(() => parseTripHeader(parser)).to.throw(
      SegmentParseError,
      `month out of range (SECRET.DAT, line 3, col 14)
SURVEY DATE: 13 5 14
             ^^`
    )
  })
  it(`throws if day is invalid`, function() {
    const parser = new SegmentParser(
      new Segment({
        value: `SECRET CAVE
SURVEY NAME: A
SURVEY DATE: 11 5a 14
`,
        source: 'SECRET.DAT',
      })
    )
    expect(() => parseTripHeader(parser)).to.throw(
      SegmentParseError,
      `invalid day (SECRET.DAT, line 3, col 17)
SURVEY DATE: 11 5a 14
                ^^`
    )
  })
  it(`throws if day is out of range`, function() {
    const parser = new SegmentParser(
      new Segment({
        value: `SECRET CAVE
SURVEY NAME: A
SURVEY DATE: 11 0 14
`,
        source: 'SECRET.DAT',
      })
    )
    expect(() => parseTripHeader(parser)).to.throw(
      SegmentParseError,
      `day out of range (SECRET.DAT, line 3, col 17)
SURVEY DATE: 11 0 14
                ^`
    )
  })
  it(`throws if year is invalid`, function() {
    const parser = new SegmentParser(
      new Segment({
        value: `SECRET CAVE
SURVEY NAME: A
SURVEY DATE: 11 5 14a
`,
        source: 'SECRET.DAT',
      })
    )
    expect(() => parseTripHeader(parser)).to.throw(
      SegmentParseError,
      `invalid year (SECRET.DAT, line 3, col 19)
SURVEY DATE: 11 5 14a
                  ^^^`
    )
  })
  it(`on correct trip header`, function() {
    const parser = new SegmentParser(
      new Segment({
        value: `SECRET CAVE
SURVEY NAME: A
SURVEY DATE: 7 10 79  COMMENT:Entrance Passage
SURVEY TEAM:
D.SMITH,R.BROWN,S.MURRAY
DECLINATION: 1.00  FORMAT: DDDDLUDRADLBF  CORRECTIONS: 2.00 3.00 4.00 CORRECTIONS2: 5.0 6.0
`,
        source: 'SECRET.DAT',
      })
    )
    const header = parseTripHeader(parser)
    expect(header).to.deep.equal(
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
        ],
        hasBacksights: true,
        lrudAssociation: 'from',
        lengthCorrection: Length.feet.of(4),
        frontsightAzimuthCorrection: Angle.degrees.of(2),
        frontsightInclinationCorrection: Angle.degrees.of(3),
        backsightAzimuthCorrection: Angle.degrees.of(5),
        backsightInclinationCorrection: Angle.degrees.of(6),
      })
    )
  })
  it(`on correct trip header without comment`, function() {
    const parser = new SegmentParser(
      new Segment({
        value: `SECRET CAVE
SURVEY NAME: A
SURVEY DATE: 7 10 79
SURVEY TEAM:
D.SMITH,R.BROWN,S.MURRAY
DECLINATION: 1.00  FORMAT: DDDDLUDRADLBF  CORRECTIONS: 2.00 3.00 4.00 CORRECTIONS2: 5.0 6.0
`,
        source: 'SECRET.DAT',
      })
    )
    const header = parseTripHeader(parser)
    expect(header).to.deep.equal(
      new TripHeader({
        caveName: 'SECRET CAVE',
        surveyName: 'A',
        date: new Date('1979/7/10'),
        comment: null,
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
        ],
        hasBacksights: true,
        lrudAssociation: 'from',
        lengthCorrection: Length.feet.of(4),
        frontsightAzimuthCorrection: Angle.degrees.of(2),
        frontsightInclinationCorrection: Angle.degrees.of(3),
        backsightAzimuthCorrection: Angle.degrees.of(5),
        backsightInclinationCorrection: Angle.degrees.of(6),
      })
    )
  })
  it(`on correct trip header without CORRECTIONS2`, function() {
    const parser = new SegmentParser(
      new Segment({
        value: `SECRET CAVE
SURVEY NAME: A
SURVEY DATE: 7 10 79  COMMENT:Entrance Passage
SURVEY TEAM:
D.SMITH,R.BROWN,S.MURRAY
DECLINATION: 1.00  FORMAT: DDDDLUDRADLBF  CORRECTIONS: 2.00 3.00 4.00
`,
        source: 'SECRET.DAT',
      })
    )
    const header = parseTripHeader(parser)
    expect(header).to.deep.equal(
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
        ],
        hasBacksights: true,
        lrudAssociation: 'from',
        lengthCorrection: Length.feet.of(4),
        frontsightAzimuthCorrection: Angle.degrees.of(2),
        frontsightInclinationCorrection: Angle.degrees.of(3),
      })
    )
  })
  it(`on correct trip header with 15-character format`, function() {
    const parser = new SegmentParser(
      new Segment({
        value: `SECRET CAVE
SURVEY NAME: A
SURVEY DATE: 7 10 79  COMMENT:Entrance Passage
SURVEY TEAM:
D.SMITH,R.BROWN,S.MURRAY
DECLINATION: 1.00  FORMAT: DDDDLUDRADLadBF  CORRECTIONS: 2.00 3.00 4.00 CORRECTIONS2: 5.0 6.0
`,
        source: 'SECRET.DAT',
      })
    )
    const header = parseTripHeader(parser)
    expect(header).to.deep.equal(
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
      })
    )
  })
  it(`on trip header with short format`, function() {
    const parser = new SegmentParser(
      new Segment({
        value: `SECRET CAVE
SURVEY NAME: A
SURVEY DATE: 7 10 79  COMMENT:Entrance Passage
SURVEY TEAM:
D.SMITH,R.BROWN,S.MURRAY
DECLINATION: 1.00  FORMAT: DDDDLUDRADL  CORRECTIONS: 2.00 3.00 4.00
`,
        source: 'SECRET.DAT',
      })
    )
    const header = parseTripHeader(parser)
    expect(header).to.deep.equal(
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
        ],
        hasBacksights: false,
        lengthCorrection: Length.feet.of(4),
        frontsightAzimuthCorrection: Angle.degrees.of(2),
        frontsightInclinationCorrection: Angle.degrees.of(3),
      })
    )
  })
  it(`on trip header without corrections`, function() {
    const parser = new SegmentParser(
      new Segment({
        value: `SECRET CAVE
SURVEY NAME: A
SURVEY DATE: 7 10 79  COMMENT:Entrance Passage
SURVEY TEAM:
D.SMITH,R.BROWN,S.MURRAY
DECLINATION: 1.00  FORMAT: DDDDLUDRADL
`,
        source: 'SECRET.DAT',
      })
    )
    const header = parseTripHeader(parser)
    expect(header).to.deep.equal(
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
        ],
        hasBacksights: false,
        lengthCorrection: Length.feet.of(0),
        frontsightAzimuthCorrection: Angle.degrees.of(0),
        frontsightInclinationCorrection: Angle.degrees.of(0),
      })
    )
  })
  it(`on trip header without format`, function() {
    const parser = new SegmentParser(
      new Segment({
        value: `SECRET CAVE
SURVEY NAME: A
SURVEY DATE: 7 10 79  COMMENT:Entrance Passage
SURVEY TEAM:
D.SMITH,R.BROWN,S.MURRAY
DECLINATION: 1.00
`,
        source: 'SECRET.DAT',
      })
    )
    const header = parseTripHeader(parser)
    expect(header).to.deep.equal(
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
          'length',
          'frontsightAzimuth',
          'frontsightInclination',
        ],
        hasBacksights: false,
        lengthCorrection: Length.feet.of(0),
        frontsightAzimuthCorrection: Angle.degrees.of(0),
        frontsightInclinationCorrection: Angle.degrees.of(0),
      })
    )
  })
})
