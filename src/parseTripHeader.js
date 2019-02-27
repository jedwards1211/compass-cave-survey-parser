/**
 * @flow
 * @prettier
 */
import { SegmentParser, Segment, SegmentParseError } from 'parse-segment'
import { Length, Angle } from 'unitized'
import {
  type TripHeader,
  type DisplayAzimuthUnit,
  type DisplayInclinationUnit,
  type DisplayLengthUnit,
  type LrudItem,
  type ShotMeasurementItem,
  type StationSide,
} from './types'

const END_OF_LINE = /\r\n?|\n/gm
const INLINE_WHITESPACE = /[ \t\v\u00a0\u1680\u2000-\u200a\u2028\u2029\u202f\u205f\u3000\ufeff]+/g
const NONWHITESPACE = /\S+/

function parseMonth(month: Segment): number {
  if (!/^\d+$/.test(month.value)) {
    throw new SegmentParseError('invalid month', month)
  }
  const value = parseInt(month.value)
  if (value < 1 || value > 12) {
    throw new SegmentParseError('month out of range', month)
  }
  return value
}

function parseDay(day: Segment): number {
  if (!/^\d+$/.test(day.value)) {
    throw new SegmentParseError('invalid day', day)
  }
  const value = parseInt(day.value)
  if (value < 1 || value > 31) {
    throw new SegmentParseError('day out of range', day)
  }
  return value
}

function parseYear(year: Segment): number {
  if (!/^\d+$/.test(year.value)) {
    throw new SegmentParseError('invalid year', year)
  }
  return parseInt(year.value)
}

function parseNumber(raw: Segment, messageIfInvalid: string): number {
  if (!/^[-+]?(\d+(\.\d*)?|\.\d+)$/.test(raw.value)) {
    throw new SegmentParseError(messageIfInvalid, raw)
  }
  return parseFloat(raw.value)
}

export const azimuthUnits: { [string]: DisplayAzimuthUnit } = {
  D: 'degrees',
  Q: 'quads',
  G: 'gradians',
}
export const inclinationUnits: { [string]: DisplayInclinationUnit } = {
  D: 'degrees',
  G: 'percentGrade',
  M: 'degreesAndMinutes',
  R: 'gradians',
  W: 'depthGauge',
}
export const lengthUnits: { [string]: DisplayLengthUnit } = {
  D: 'decimalFeet',
  I: 'feetAndInches',
  M: 'meters',
}
export const lrudItems: { [string]: LrudItem } = {
  L: 'left',
  R: 'right',
  U: 'up',
  D: 'down',
}
export const shotMeasurementItems: { [string]: ShotMeasurementItem } = {
  L: 'length',
  A: 'frontsightAzimuth',
  D: 'frontsightInclination',
  a: 'backsightAzimuth',
  d: 'backsightInclination',
}
export const stationSides: { [string]: StationSide } = {
  F: 'from',
  T: 'to',
}

function oneOf<V>(
  parser: SegmentParser,
  items: { [string]: V },
  itemType: string
): V {
  const segment = parser.segment.charAt(parser.index)
  if (!segment.length) {
    throw new SegmentParseError(`missing ${itemType}`, segment)
  }
  const value = items[segment.value]
  if (!value) throw new SegmentParseError(`invalid ${itemType}`, segment)
  parser.index++
  return value
}

export default function parseTripHeader(parser: SegmentParser): TripHeader {
  const caveName = parser.nextDelimited(END_OF_LINE).trim().value
  parser.skip(INLINE_WHITESPACE)
  parser.expectIgnoreCase('SURVEY NAME:')
  parser.skip(INLINE_WHITESPACE)
  const surveyName = parser.nextDelimited(END_OF_LINE).trim().value
  parser.skip(INLINE_WHITESPACE)
  parser.expectIgnoreCase('SURVEY DATE:')
  parser.skip(INLINE_WHITESPACE)
  const month = parseMonth(
    parser.nextDelimited(INLINE_WHITESPACE, 'missing month')
  )
  const day = parseDay(parser.nextDelimited(INLINE_WHITESPACE, 'missing day'))
  const year = parseYear(parser.match(NONWHITESPACE, 'missing year').segment)
  const date = new Date(year, month - 1, day)
  const hasComment = parser.skip(/\s+COMMENT:/gi)
  const restOfLine = parser.nextDelimited(END_OF_LINE).trim().value
  const comment = hasComment ? restOfLine : null
  parser.expectIgnoreCase('SURVEY TEAM:')
  parser.nextDelimited(END_OF_LINE)
  const rawSurveyors = parser.nextDelimited(END_OF_LINE).value.trim()
  const surveyors =
    rawSurveyors === '?'
      ? []
      : rawSurveyors
          .split(rawSurveyors.includes(';') ? /\s*;\s*/ : /\s*,\s*/)
          .filter(Boolean)
  parser.expectIgnoreCase('DECLINATION:')
  parser.skip(INLINE_WHITESPACE)
  const declination = Angle.degrees.of(
    parseNumber(
      parser.nextDelimited(INLINE_WHITESPACE, 'missing declination'),
      'invalid declination'
    )
  )
  parser.expectIgnoreCase('FORMAT:')
  parser.skip(INLINE_WHITESPACE)
  const formatIndex = parser.index
  const format = parser.nextDelimited(INLINE_WHITESPACE)
  parser.index = formatIndex
  const displayAzimuthUnit = oneOf(parser, azimuthUnits, 'azimuth unit')
  const displayLengthUnit = oneOf(parser, lengthUnits, 'length unit')
  const displayLrudUnit = oneOf(parser, lengthUnits, 'lrud unit')
  const displayInclinationUnit = oneOf(
    parser,
    inclinationUnits,
    'inclination unit'
  )
  const lrudOrder = [
    oneOf(parser, lrudItems, 'lrud item'),
    oneOf(parser, lrudItems, 'lrud item'),
    oneOf(parser, lrudItems, 'lrud item'),
    oneOf(parser, lrudItems, 'lrud item'),
  ]
  const shotMeasurementOrder = [
    oneOf(parser, shotMeasurementItems, 'shot measurement item'),
    oneOf(parser, shotMeasurementItems, 'shot measurement item'),
    oneOf(parser, shotMeasurementItems, 'shot measurement item'),
  ]
  if (format.length >= 15) {
    shotMeasurementOrder.push(
      oneOf(parser, shotMeasurementItems, 'shot measurement item'),
      oneOf(parser, shotMeasurementItems, 'shot measurement item')
    )
  }
  const hasBacksights =
    format.length > 11 && parser.segment.charAt(parser.index++).value === 'B'
  const lrudAssociation =
    format.length > 12 ? oneOf(parser, stationSides, 'lrud association') : null

  parser.skip(INLINE_WHITESPACE)
  parser.expectIgnoreCase('CORRECTIONS:')
  parser.skip(INLINE_WHITESPACE)
  const frontsightAzimuthCorrection = Angle.degrees.of(
    parseNumber(
      parser.nextDelimited(INLINE_WHITESPACE, 'missing inclination correction'),
      'invalid azimuth correction'
    )
  )
  const frontsightInclinationCorrection = Angle.degrees.of(
    parseNumber(
      parser.nextDelimited(INLINE_WHITESPACE, 'missing length correction'),
      'invalid inclination correction'
    )
  )
  const lengthCorrection = Length.feet.of(
    parseNumber(
      parser.match(NONWHITESPACE, 'missing length correction').segment,
      'invalid length correction'
    )
  )
  parser.skip(INLINE_WHITESPACE)
  const result: TripHeader = {
    caveName,
    surveyName,
    date,
    comment,
    rawSurveyors,
    surveyors,
    declination,
    displayAzimuthUnit,
    displayLengthUnit,
    displayLrudUnit,
    displayInclinationUnit,
    lrudOrder,
    shotMeasurementOrder,
    hasBacksights,
    frontsightAzimuthCorrection,
    frontsightInclinationCorrection,
    lengthCorrection,
  }
  if (lrudAssociation) result.lrudAssociation = lrudAssociation
  if (parser.skip(/CORRECTIONS2:/gi)) {
    parser.skip(INLINE_WHITESPACE)
    result.backsightAzimuthCorrection = Angle.degrees.of(
      parseNumber(
        parser.nextDelimited(
          INLINE_WHITESPACE,
          'missing backsight inclination correction'
        ),
        'invalid azimuth correction'
      )
    )
    result.backsightInclinationCorrection = Angle.degrees.of(
      parseNumber(
        parser.match(NONWHITESPACE, 'missing backsight inclination correction')
          .segment,
        'invalid inclination correction'
      )
    )
  }
  parser.nextDelimited(END_OF_LINE)

  return result
}
