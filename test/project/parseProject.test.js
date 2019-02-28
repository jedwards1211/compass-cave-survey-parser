/**
 * @flow
 * @prettier
 */

import { describe, it } from 'mocha'
import { expect } from 'chai'

import { Segment, SegmentParser } from 'parse-segment'
import fs from 'fs'
import path from 'path'

import parseProject from '../../src/project/parseProject'

import FileDirective from '../../src/project/FileDirective'

import { Length } from 'unitized'

describe(`parseProject`, function() {
  it(`parses link stations`, function() {
    const parser = new SegmentParser(
      new Segment({
        value: fs.readFileSync(
          path.join(__dirname, 'testSurveyFile.mak'),
          'utf8'
        ),
        source: 'testSurveyFile.mak',
      })
    )
    const directives = [...parseProject(parser)]
    const file = directives.find(d => d instanceof FileDirective)
    expect(file).to.deep.equal({
      file: 'FULFORD.DAT',
      linkStations: [
        {
          name: 'A',
          location: {
            easting: Length.feet.of(1.1),
            northing: Length.feet.of(2.2),
            elevation: Length.feet.of(3.3),
          },
        },
        { name: 'B', location: null },
        {
          name: 'C',
          location: {
            easting: Length.meters.of(4.4),
            northing: Length.meters.of(5.5),
            elevation: Length.meters.of(6.6),
          },
        },
      ],
    })
  })
  it(`works on Lechuguilla.mak`, function() {
    const parser = new SegmentParser(
      new Segment({
        value: fs.readFileSync(path.join(__dirname, 'Lechuguilla.mak'), 'utf8'),
        source: 'Lechuguilla.mak',
      })
    )
    const directives = [...parseProject(parser)]
    expect(directives.join('\n')).to
      .equal(`@546866.900,3561472.900,1414.100,13,-0.260;
&North American 1983;
!ot;
/
%-0.260;
#ENTRANCE.DAT;
/
#NEAREAST.DAT;
/
#FAREAST.DAT;
/
#SOUTH.DAT;
/
#FARSOUTH.DAT;
/
#NEARWEST.DAT;
/
#FARWEST.DAT;`)
  })
})
