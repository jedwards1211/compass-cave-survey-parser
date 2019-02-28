// @flow
import CompassProjectDirective from './CompassProjectDirective'

export default class CommentDirective extends CompassProjectDirective {
  +comment: string

  constructor(comment: string) {
    super()
    this.comment = comment
  }

  toString(): string {
    return '/' + this.comment
  }
}
