/**
 * @flow
 * @prettier
 */
import { SegmentParser, Segment, SegmentParseError } from 'parse-segment'
import { Length, Angle } from 'unitized'
import { END_OF_LINE, INLINE_WHITESPACE, NONWHITESPACE } from '../util/regexes'
import TripHeader, {
  azimuthUnits,
  inclinationUnits,
  lengthUnits,
  lrudItems,
  shotMeasurementItems,
  stationSides,
} from './TripHeader'

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
  const caveName = parser.nextDelimited(END_OF_LINE).trim().value || null

  parser.expectIgnoreCase('SURVEY NAME:')
  parser.skip(INLINE_WHITESPACE)
  const surveyName = parser.nextDelimited(END_OF_LINE).trim().value || null

  parser.expectIgnoreCase('SURVEY DATE:')
  parser.skip(INLINE_WHITESPACE)
  const month = parseMonth(
    parser.nextDelimited(INLINE_WHITESPACE, 'missing month')
  )
  const day = parseDay(parser.nextDelimited(INLINE_WHITESPACE, 'missing day'))
  const year = parseYear(parser.match(NONWHITESPACE, 'missing year').segment)
  const date = new Date(year, month - 1, day)

  const hasComment = parser.skip(/\s+COMMENT:\s*/giy)
  const commentSegment = parser.nextDelimited(END_OF_LINE)
  const comment = hasComment ? commentSegment.value.trim() || null : null

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
      parser.match(NONWHITESPACE, 'missing declination').segment,
      'invalid declination'
    )
  )

  let displayAzimuthUnit = 'degrees'
  let displayLengthUnit = 'decimalFeet'
  let displayLrudUnit = 'decimalFeet'
  let displayInclinationUnit = 'degrees'
  let lrudOrder = ['left', 'up', 'down', 'right']
  let shotMeasurementOrder = [
    'length',
    'frontsightAzimuth',
    'frontsightInclination',
  ]
  let hasBacksights = false
  let lrudAssociation = null

  if (parser.skip(/\s+FORMAT:\s*/giy)) {
    const formatIndex = parser.index
    const format = parser.match(NONWHITESPACE, 'missing format').segment
    parser.index = formatIndex
    displayAzimuthUnit = oneOf(parser, azimuthUnits, 'azimuth unit')
    displayLengthUnit = oneOf(parser, lengthUnits, 'length unit')
    displayLrudUnit = oneOf(parser, lengthUnits, 'lrud unit')
    displayInclinationUnit = oneOf(parser, inclinationUnits, 'inclination unit')
    lrudOrder = [
      oneOf(parser, lrudItems, 'lrud item'),
      oneOf(parser, lrudItems, 'lrud item'),
      oneOf(parser, lrudItems, 'lrud item'),
      oneOf(parser, lrudItems, 'lrud item'),
    ]
    shotMeasurementOrder = [
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
    hasBacksights =
      format.length > 11 && parser.segment.charAt(parser.index++).value === 'B'
    lrudAssociation =
      format.length > 12
        ? oneOf(parser, stationSides, 'lrud association')
        : null
  }

  let frontsightAzimuthCorrection = Angle.degrees.of(0)
  let frontsightInclinationCorrection = Angle.degrees.of(0)
  let lengthCorrection = Length.feet.of(0)
  if (parser.skip(/\s+CORRECTIONS:\s*/gimy)) {
    frontsightAzimuthCorrection = Angle.degrees.of(
      parseNumber(
        parser.nextDelimited(
          INLINE_WHITESPACE,
          'missing inclination correction'
        ),
        'invalid azimuth correction'
      )
    )
    frontsightInclinationCorrection = Angle.degrees.of(
      parseNumber(
        parser.nextDelimited(INLINE_WHITESPACE, 'missing length correction'),
        'invalid inclination correction'
      )
    )
    lengthCorrection = Length.feet.of(
      parseNumber(
        parser.match(NONWHITESPACE, 'missing length correction').segment,
        'invalid length correction'
      )
    )
  }
  const result = new TripHeader({
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
  })
  if (lrudAssociation) result.lrudAssociation = lrudAssociation
  if (parser.skip(/\s+CORRECTIONS2:\s*/giy)) {
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

  return result
}
