// @flow

import Shot from './Shot'
import TripHeader from './TripHeader'

export type TripProps = {|
  header: TripHeader,
  shots: Array<Shot>,
|}

export default class Trip {
  header: TripHeader
  shots: Array<Shot>

  constructor({ header, shots }: TripProps) {
    this.header = header
    this.shots = shots
    shots.forEach(shot => (shot.trip = this))
  }

  toString(): string {
    const { header, shots } = this
    return `${header.toString()}

        FROM           TO   LENGTH  BEARING      INC     LEFT       UP     DOWN    RIGHT${
          header.hasBacksights ? '     AZM2     INC2' : ''
        }   FLAGS  COMMENTS

${shots.join('\n')}`.replace(/\n/g, '\r\n')
  }
}
