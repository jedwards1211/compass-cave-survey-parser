/**
 * @flow
 * @prettier
 */

import { describe, it } from 'mocha'
import { expect } from 'chai'
import { Segment, SegmentParser } from 'parse-segment'
import { Length, Angle } from 'unitized'
import parseTripHeader from '../src/parseTripHeader'

describe(`parseTripHeader`, function() {
  it(`on correct trip header`, function() {
    const parser = new SegmentParser(
      new Segment({
        value: `SECRET CAVE
SURVEY NAME: A
SURVEY DATE: 7 10 79  COMMENT:Entrance Passage
SURVEY TEAM:
D.SMITH,R.BROWN,S.MURRAY
DECLINATION: 1.00  FORMAT: DDDDLUDRADLBF  CORRECTIONS: 2.00 3.00 4.00 CORRECTIONS2: 5.0 6.0
<END>
`,
        source: 'SECRET.DAT',
      })
    )
    const header = parseTripHeader(parser)
    expect(header).to.deep.equal({
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
      lengthCorrection: Length.meters.of(4),
      frontsightAzimuthCorrection: Angle.degrees.of(2),
      frontsightInclinationCorrection: Angle.degrees.of(3),
      backsightAzimuthCorrection: Angle.degrees.of(5),
      backsightInclinationCorrection: Angle.degrees.of(6),
    })
    parser.expect('<END>')
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
<END>
`,
        source: 'SECRET.DAT',
      })
    )
    const header = parseTripHeader(parser)
    expect(header).to.deep.equal({
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
      lengthCorrection: Length.meters.of(4),
      frontsightAzimuthCorrection: Angle.degrees.of(2),
      frontsightInclinationCorrection: Angle.degrees.of(3),
      backsightAzimuthCorrection: Angle.degrees.of(5),
      backsightInclinationCorrection: Angle.degrees.of(6),
    })
    parser.expect('<END>')
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
<END>
`,
        source: 'SECRET.DAT',
      })
    )
    const header = parseTripHeader(parser)
    expect(header).to.deep.equal({
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
      lengthCorrection: Length.meters.of(4),
      frontsightAzimuthCorrection: Angle.degrees.of(2),
      frontsightInclinationCorrection: Angle.degrees.of(3),
    })
    parser.expect('<END>')
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
<END>
`,
        source: 'SECRET.DAT',
      })
    )
    const header = parseTripHeader(parser)
    expect(header).to.deep.equal({
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
      lengthCorrection: Length.meters.of(4),
      frontsightAzimuthCorrection: Angle.degrees.of(2),
      frontsightInclinationCorrection: Angle.degrees.of(3),
      backsightAzimuthCorrection: Angle.degrees.of(5),
      backsightInclinationCorrection: Angle.degrees.of(6),
    })
    parser.expect('<END>')
  })
})
