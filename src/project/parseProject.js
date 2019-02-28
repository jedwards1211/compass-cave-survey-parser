/**
 * @flow
 * @prettier
 */
import CompassProjectDirective from './CompassProjectDirective'
import { SegmentParser, SegmentParseError } from 'parse-segment'
import { WHITESPACE, END_OF_LINE } from '../util/regexes'
import FileDirective from './FileDirective'
import LocationDirective from './LocationDirective'
import { type LinkStation } from './LInkStation'
import {
  Length,
  type Unit,
  type UnitType,
  UnitizedNumber,
  Angle,
} from 'unitized'
import { type NEVLocation } from './NEVLocation'

import DatumDirective from './DatumDirective'

import UTMConvergenceDirective from './UTMConvergenceDirective'

import UTMZoneDirective from './UTMZoneDirective'

import FlagsDirective from './FlagsDirective'

import CommentDirective from './CommentDirective'

const WHITESPACE_AND_COMMENTS = /(\s|\/[^\r\n]+)+/g
const FILE_NAME = /[^,;/]+/g
const DATUM = /[^;/]+/g
const LINK_STATION = /[^,;/[]+/g
const NUMBER = /[-+]?\d+(\.\d*)?|\.\d+/g

export default function* parseProject(
  parser: SegmentParser
): Iterable<CompassProjectDirective> {
  while ((parser.skip(WHITESPACE), !parser.isAtEnd())) {
    switch (parser.segment.value.charAt(parser.index++)) {
      case '#':
        yield surveyFile(parser)
        continue
      case '@':
        yield location(parser)
        continue
      case '&':
        yield datum(parser)
        continue
      case '%':
        yield utmConvergence(parser)
        continue
      case '$':
        yield utmZone(parser)
        continue
      case '!':
        yield flags(parser)
        continue
      case '/':
        yield comment(parser)
        continue
      default:
        // ignore silly ASCII control characters, I've seen 0x1a (SUB) in compass files
        if (parser.segment.charCodeAt(parser.index - 1) < 0x20) {
          break
        }
        throw new SegmentParseError(
          'invalid directive',
          parser.segment.charAt(parser.index - 1)
        )
    }
  }
}

function parseNumber<T: UnitType>(
  parser: SegmentParser,
  unit: Unit<T>,
  messageIfInvalid: string
): UnitizedNumber<T> {
  return unit.of(parseFloat(parser.match(NUMBER, messageIfInvalid)[0]))
}

function lengthUnit(parser: SegmentParser): Unit<Length> {
  switch (parser.segment.value.charAt(parser.index++)) {
    case 'f':
    case 'F':
      return Length.feet
    case 'm':
    case 'M':
      return Length.meters
    default:
      throw new SegmentParseError(
        'invalid length unit',
        parser.segment.charAt(parser.index - 1)
      )
  }
}

function surveyFile(parser: SegmentParser): FileDirective {
  const file = parser.match(FILE_NAME, 'missing file name').segment.trim()
  let linkStations: ?Array<LinkStation> = null
  while ((parser.skip(WHITESPACE_AND_COMMENTS), !parser.isAtEnd())) {
    switch (parser.segment.value.charAt(parser.index++)) {
      case ';':
        return new FileDirective(file.toString(), linkStations)
      case ',': {
        parser.skip(WHITESPACE_AND_COMMENTS)
        const stationName: string = parser
          .match(LINK_STATION, 'missing station name')[0]
          .trim()
        let location: ?NEVLocation = null

        parser.skip(WHITESPACE_AND_COMMENTS)
        if (parser.skip(/\[/g)) {
          parser.skip(WHITESPACE_AND_COMMENTS)
          const unit: Unit<Length> = lengthUnit(parser)
          parser.skip(WHITESPACE_AND_COMMENTS)
          parser.expect(',')
          parser.skip(WHITESPACE_AND_COMMENTS)
          const easting = parseNumber(
            parser,
            unit,
            'missing or invalid easting'
          )
          parser.skip(WHITESPACE_AND_COMMENTS)
          parser.expect(',')
          parser.skip(WHITESPACE_AND_COMMENTS)
          const northing = parseNumber(
            parser,
            unit,
            'missing or invalid northing'
          )
          parser.skip(WHITESPACE_AND_COMMENTS)
          parser.expect(',')
          parser.skip(WHITESPACE_AND_COMMENTS)
          const elevation = parseNumber(
            parser,
            unit,
            'missing or invalid elevation'
          )
          parser.skip(WHITESPACE_AND_COMMENTS)
          parser.expect(']')
          parser.skip(WHITESPACE_AND_COMMENTS)
          location = { easting, northing, elevation }
        }
        if (linkStations == null) linkStations = []
        linkStations.push({ name: stationName, location })
        break
      }
      default:
        throw new SegmentParseError(
          'invalid character',
          parser.segment.charAt(parser.index)
        )
    }
  }
  throw new SegmentParseError(
    'missing ; at end of file line',
    parser.segment.charAt(parser.index)
  )
}

function parseUTMZone(parser: SegmentParser): number {
  const text = parser.match(NUMBER, 'missing UTM zone').segment
  const utmZone = parseInt(text)
  if (text.includes('.') || utmZone < 1 || utmZone > 60) {
    throw new SegmentParseError('invalid UTM zone', text)
  }
  return utmZone
}

function parseUTMConvergence(parser: SegmentParser): UnitizedNumber<Angle> {
  return parseNumber(parser, Angle.degrees, 'missing UTM convergence')
}

function location(parser: SegmentParser): LocationDirective {
  parser.skip(WHITESPACE)
  const easting = parseNumber(
    parser,
    Length.meters,
    'missing or invalid easting'
  )
  parser.skip(WHITESPACE)
  parser.expect(',')
  parser.skip(WHITESPACE)
  const northing = parseNumber(
    parser,
    Length.meters,
    'missing or invalid northing'
  )
  parser.skip(WHITESPACE)
  parser.expect(',')
  parser.skip(WHITESPACE)
  const elevation = parseNumber(
    parser,
    Length.meters,
    'missing or invalid elevation'
  )
  parser.skip(WHITESPACE)
  parser.expect(',')
  parser.skip(WHITESPACE)
  const utmZone = parseUTMZone(parser)
  parser.skip(WHITESPACE)
  parser.expect(',')
  parser.skip(WHITESPACE)
  const utmConvergence = parseUTMConvergence(parser)
  parser.expect(';')

  return new LocationDirective({
    easting,
    northing,
    elevation,
    utmZone,
    utmConvergence,
  })
}

function datum(parser: SegmentParser): DatumDirective {
  const result = new DatumDirective(
    parser.match(DATUM, 'missing datum')[0].trim()
  )
  parser.expect(';')
  return result
}

function utmConvergence(parser: SegmentParser): UTMConvergenceDirective {
  parser.skip(WHITESPACE)
  const result = new UTMConvergenceDirective(parseUTMConvergence(parser))
  parser.expect(';')
  return result
}

function utmZone(parser: SegmentParser): UTMZoneDirective {
  parser.skip(WHITESPACE)
  const result = new UTMZoneDirective(parseUTMZone(parser))
  parser.expect(';')
  return result
}

function flags(parser: SegmentParser): FlagsDirective {
  let flags: number = 0
  while (!parser.isAtEnd()) {
    switch (parser.segment.value.charAt(parser.index++)) {
      case 'o':
        break
      case 'O':
        flags |= FlagsDirective.OVERRIDE_LRUDS
        break
      case 't':
        break
      case 'T':
        flags |= FlagsDirective.LRUDS_AT_TO_STATION
        break
      case ';':
        return new FlagsDirective(flags)
      default:
        throw new SegmentParseError(
          'invalid character',
          parser.segment.charAt(parser.index)
        )
    }
  }
  throw new SegmentParseError(
    'missing or incomplete flags',
    parser.segment.charAt(parser.index)
  )
}

function comment(parser: SegmentParser): CommentDirective {
  return new CommentDirective(parser.nextDelimited(END_OF_LINE).value.trim())
}
