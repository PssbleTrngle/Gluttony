import { sign } from 'jsonwebtoken'
import { define } from 'typeorm-seeding'
import { Faked } from '..'
import config from '../../config'
import { stripHidden } from '../../decorators/Hidden'
import Token from '../../models/Token'
import User from '../../models/User'

define(Token, (faker, ctx?: { user?: User }) => {
   const token: Faked<Token> = new Token()

   if (!ctx?.user) throw new Error('No user provided')

   const now = new Date()
   const created = faker.date.between(ctx.user.timestamps.created, now)
   const expires_at = faker.date.between(created, now)

   token.timestamps = { created, updated: created }
   token.expires_at = expires_at
   token.reason = 'Generated Fake Token'
   token.user = ctx.user
   token.refresh_token = sign({ user: stripHidden(ctx.user), expires_at }, config.auth.jwt.refresh_secret)

   return token
})
