/**
 * @flow
 * @prettier
 */

import fs from 'fs-extra'
import path from 'path'
import { describe, it } from 'mocha'
import { expect } from 'chai'
import parseProjectFile from '../../src/project/parseProjectFile'

describe(`parseProjectFile`, function() {
  const lechFile = process.env.LECHUGUILLA_FILE
  if (lechFile && fs.existsSync(lechFile)) {
    it(`works on ${path.basename(lechFile)}`, async function(): Promise<void> {
      this.timeout(30000)
      const project = await parseProjectFile(lechFile)
      expect(project.directives.join('\n')).to
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
  }
})
