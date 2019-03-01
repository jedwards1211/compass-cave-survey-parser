/**
 * @flow
 * @prettier
 */
import CompassProject from './CompassProject'
import fs from 'fs-extra'
import path from 'path'
import { Segment, SegmentParser } from 'parse-segment'
import parseProject from './parseProject'
import FileDirective from './FileDirective'
import parseTrips from '../survey/parseTrips'

export default async function parseProjectFile(
  file: string,
  {
    parseSurveyFiles,
  }: {
    parseSurveyFiles?: ?boolean,
  } = {}
): Promise<CompassProject> {
  const basedir = path.dirname(path.resolve(file))

  async function readIntoParser(file: string): Promise<SegmentParser> {
    const resolvedFile = path.resolve(basedir, file)
    return new SegmentParser(
      new Segment({
        value: await fs.readFile(resolvedFile, 'ascii'),
        source: file,
      })
    )
  }

  const directives = [
    ...parseProject(await readIntoParser(path.basename(file))),
  ]
  const project = new CompassProject({
    file,
    directives,
  })

  if (false !== parseSurveyFiles) {
    for (let directive of directives) {
      if (directive instanceof FileDirective) {
        directive.data = [...parseTrips(await readIntoParser(directive.file))]
      }
    }
  }

  return project
}
