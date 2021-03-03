export interface IModel {
   id: number | string
}

export interface ITimestamps {
   created: string
   updated: string
}

export interface IUser extends IModel {
   timestamps: ITimestamps
   username: string
   email?: string
}

export interface IToken extends IModel {
   timestamps: ITimestamps
   expires_at: string
   user: IUser
   reason: string
   active: boolean
}

export interface ITokens {
   refresh_token: string
   access_token: string
}