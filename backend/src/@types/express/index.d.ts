import Token from '../../models/Token'
import User from '../../models/User'

declare global {
   namespace Express {
      export interface Request {
         user?: User
         token?: Token
         authError?: Error
      }
   }
}
