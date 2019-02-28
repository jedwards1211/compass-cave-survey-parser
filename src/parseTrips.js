/**
 * @flow
 * @prettier
 */
import { SegmentParser } from 'parse-segment'
import { type Trip } from './types'
import parseTripHeader from './parseTripHeader'
import parseShots from './parseShots'
import { WHITESPACE } from './regexes'

export default function* parseTrips(parser: SegmentParser): Iterable<Trip> {
  while (
    (parser.skip(WHITESPACE),
    !parser.isAtEnd() && parser.currentChar() !== '\u001a')
  ) {
    const header = parseTripHeader(parser)
    parser.skip(WHITESPACE)
    parser.skip(/FROM\s+TO[^\r\n]+/g)
    parser.skip(WHITESPACE)
    const shots = [...parseShots(parser, header)]
    yield { header, shots }
  }
}
