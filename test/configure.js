/* eslint-env node */

import chai from 'chai'
import chaiSubset from 'chai-subset'
chai.use(chaiSubset)

if (process.argv.indexOf('--watch') >= 0) {
  before(() => process.stdout.write('\u001b[2J\u001b[1;1H\u001b[3J'))
}
