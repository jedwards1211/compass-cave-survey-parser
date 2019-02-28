/**
 * @flow
 * @prettier
 */

import { describe, it } from 'mocha'
import { expect } from 'chai'
import fs from 'fs'
import path from 'path'
import { Segment, SegmentParser } from 'parse-segment'
import parseTrips from '../src/parseTrips'
import { Angle, Length } from 'unitized'

describe(`parseTrips`, function() {
  it(`works`, function() {
    const data = fs.readFileSync(path.resolve(__dirname, 'Fulford.dat'), 'utf8')
    const parser = new SegmentParser(
      new Segment({
        value: data,
        source: 'Fulford.dat',
      })
    )
    const trips = [...parseTrips(parser)]
    expect(trips).to.have.lengthOf(25)
    expect(trips).to.containSubset([
      {
        header: {
          caveName: 'Fulford Cave',
          surveyName: 'A',
          comment: 'Entrance Passage',
          declination: Angle.degrees.of(11.18),
        },
        shots: [
          {
            fromStationName: 'A1',
            toStationName: 'A2',
            length: Length.feet.of(21.75),
          },
          {
            fromStationName: 'A2',
            toStationName: 'A3',
            length: Length.feet.of(23.75),
          },
        ],
      },
      {
        header: {
          caveName: 'Fulford Cave',
          surveyName: 'A+',
          date: new Date('1987/6/20'),
          comment: 'Big Meander Area',
          surveyors: ['Steve Reames', 'Stan Allison'],
        },
        shots: [
          {
            fromStationName: 'A13',
            toStationName: 'A14',
          },
          {
            fromStationName: 'A14',
            toStationName: 'A15',
          },
        ],
      },
    ])

    expect(trips[24]).to.containSubset({
      header: {
        caveName: 'Fulford Cave',
        surveyName: 'CL',
        date: new Date('1989/6/10'),
      },
      shots: [
        {
          fromStationName: 'CA3',
          toStationName: 'CL1',
        },
      ],
    })
  })
})
