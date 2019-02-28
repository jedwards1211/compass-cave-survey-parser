/**
 * @flow
 * @prettier
 */
import { SegmentParser, Segment, SegmentParseError } from 'parse-segment'
import { END_OF_LINE, INLINE_WHITESPACE, NONWHITESPACE } from './regexes'

import {
  Length,
  UnitizedNumber,
  type UnitType,
  type Unit,
  Angle,
} from 'unitized'

import Shot from './Shot'
import TripHeader from './TripHeader'

function parseNumber<T: UnitType>(
  raw: Segment,
  unit: Unit<T>,
  messageIfInvalid: string
): ?UnitizedNumber<T> {
  if (!/^[-+]?(\d+(\.\d*)?|\.\d+)$/.test(raw.value)) {
    throw new SegmentParseError(messageIfInvalid, raw)
  }
  const value = parseFloat(raw.value)
  return value <= -999 ? null : unit.of(value)
}

function parseLrud(
  raw: Segment,
  messageIfInvalid: string
): ?UnitizedNumber<Length> {
  if (!/^[-+]?(\d+(\.\d*)?|\.\d+)$/.test(raw.value)) {
    throw new SegmentParseError(messageIfInvalid, raw)
  }
  const value = parseFloat(raw.value)
  return value < 0 ? null : Length.feet.of(value)
}

export default function* parseShots(
  parser: SegmentParser,
  header: TripHeader
): Iterable<Shot> {
  while (!parser.isAtEnd() && !parser.skip(/\f/g)) {
    parser.skip(INLINE_WHITESPACE)
    if (parser.isAtEndOfLine()) {
      parser.nextDelimited(END_OF_LINE)
      continue
    }
    const fromStationName = parser.nextDelimited(
      INLINE_WHITESPACE,
      'missing to station'
    ).value
    const toStationName = parser.nextDelimited(
      INLINE_WHITESPACE,
      'missing length'
    ).value
    const length = parseNumber(
      parser.nextDelimited(INLINE_WHITESPACE, 'missing frontsight azimuth'),
      Length.feet,
      'invalid length'
    )
    if (!length) {
      parser.nextDelimited(END_OF_LINE)
      continue
    }
    const frontsightAzimuth = parseNumber(
      parser.nextDelimited(INLINE_WHITESPACE, 'missing frontsight inclination'),
      Angle.degrees,
      'invalid frontsight azimuth'
    )
    const frontsightInclination = parseNumber(
      parser.nextDelimited(INLINE_WHITESPACE, 'missing left'),
      Angle.degrees,
      'invalid frontsight inclination'
    )
    const left = parseLrud(
      parser.nextDelimited(INLINE_WHITESPACE, 'missing up'),
      'invalid left'
    )
    const up = parseLrud(
      parser.nextDelimited(INLINE_WHITESPACE, 'missing down'),
      'invalid up'
    )
    const down = parseLrud(
      parser.nextDelimited(INLINE_WHITESPACE, 'missing right'),
      'invalid down'
    )
    const right = parseLrud(
      parser.match(NONWHITESPACE, 'missing right').segment,
      'invalid right'
    )
    parser.skip(INLINE_WHITESPACE)
    let backsightAzimuth = null
    let backsightInclination = null
    if (header.hasBacksights) {
      backsightAzimuth = parseNumber(
        parser.nextDelimited(
          INLINE_WHITESPACE,
          'missing backsight inclination'
        ),
        Angle.degrees,
        'invalid azimuth'
      )
      backsightInclination = parseNumber(
        parser.match(NONWHITESPACE, 'missing backsight inclination').segment,
        Angle.degrees,
        'invalid inclination'
      )
      parser.skip(INLINE_WHITESPACE)
    }
    const shot = new Shot({
      fromStationName,
      toStationName,
      length,
      frontsightAzimuth,
      frontsightInclination,
      backsightAzimuth,
      backsightInclination,
      left,
      up,
      down,
      right,
    })
    if (parser.skip(/#\|/g)) {
      let char
      while (((char = parser.currentChar()), parser.index++, char !== '#')) {
        switch (char) {
          case 'L':
            shot.excludedFromLength = true
            break
          case 'P':
            shot.excludedFromPlotting = true
            break
          case 'X':
            shot.excludedFromAllProcessing = true
            break
          case 'C':
            shot.doNotAdjust = true
            break
        }
      }
    }
    const comment = parser.nextDelimited(END_OF_LINE).trim().value
    if (comment.length) shot.comment = comment
    yield shot
  }
}
