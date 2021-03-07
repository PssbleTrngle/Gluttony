import Session from '../../models/Session'
import User from '../../models/User'

declare global {
   namespace Express {
      export interface Request {
         user?: User
         session?: Session
         authError?: Error
      }
   }
}
