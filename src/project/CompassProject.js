// @flow

import CompassProjectDirective from './CompassProjectDirective'

export type CompassProjectProps = {
  file: string,
  directives: Array<CompassProjectDirective>,
}

export default class CompassProject {
  file: string
  directives: Array<CompassProjectDirective>

  constructor({ file, directives }: CompassProjectProps) {
    this.file = file
    this.directives = directives
  }
}
