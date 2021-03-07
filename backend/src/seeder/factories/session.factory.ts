import { sign } from 'jsonwebtoken'
import { define } from 'typeorm-seeding'
import { Faked } from '..'
import config from '../../config'
import { stripHidden } from '../../decorators/Hidden'
import Session from '../../models/Session'
import User from '../../models/User'

define(Session, (faker, ctx?: { user?: User }) => {
   const session: Faked<Session> = new Session()

   if (!ctx?.user) throw new Error('No user provided')

   const now = new Date()
   const created = faker.date.between(ctx.user.timestamps.created, now)
   const expires_at = faker.date.between(created, now)

   session.timestamps = { created, updated: created }
   session.expires_at = expires_at
   session.reason = 'Generated Fake Token'
   session.user = ctx.user
   session.refresh_token = sign({ user: stripHidden(ctx.user), expires_at }, config.auth.jwt.refresh_secret)

   return session
})
