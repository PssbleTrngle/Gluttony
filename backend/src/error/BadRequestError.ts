import HttpError from './HttpError'

export default class BadRequestError extends HttpError {
   constructor(message = 'Bad Request') {
      super(message, 400)
   }
}
