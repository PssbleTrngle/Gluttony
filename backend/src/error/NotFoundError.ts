import HttpError from './HttpError'

export default class NotFoundError extends HttpError {
   constructor() {
      super('Could not find resource', 404)
   }
}
