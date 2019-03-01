/**
 * @flow
 * @prettier
 */
import { SegmentParser } from 'parse-segment'
import parseTripHeader from './parseTripHeader'
import parseShots from './parseShots'
import { WHITESPACE, END_OF_LINE } from '../util/regexes'
import Trip from './Trip'

export default function* parseTrips(parser: SegmentParser): Iterable<Trip> {
  while (!parser.isAtEnd() && parser.currentChar() !== '\u001a') {
    const header = parseTripHeader(parser)
    parser.skip(WHITESPACE)
    parser.match(/FROM\s+TO[^\r\n]+/giy, 'missing FROM TO etc. column headers')
    parser.nextDelimited(END_OF_LINE)
    const shots = [...parseShots(parser, header)]
    parser.nextDelimited(END_OF_LINE)
    yield new Trip({ header, shots })
  }
}
