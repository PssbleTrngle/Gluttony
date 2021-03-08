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
   credentials?: {
      email?: string
   }
   verified?: boolean
}

export interface ISession extends IModel {
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

export enum AppStatus {
   LOGGED_IN = 'logged in',
   LOGGED_OUT = 'logged out',
   OFFLINE = 'offline',
   LOADING = 'loading',
}

export interface IShow extends IModel {
   name: string
   slug: string
   image: string
   firstAired: string
   lastAired: string
   nextAired?: string
   score: string
   status: IStatus
   originalCountry: string
   originalLanguage: string
   originalNetwork: INetwork
}

type Weekday = "sunday" | "monday" | "tuesday" | "wednesday" | "thursday" | "friday" | "saturday"
export interface IShowFull extends IShow {
   artworks: IArtwork[]
   networks: INetwork[]
   genres: IGenre[]
   characters: ICharacter[]
   airsDays: Record<Weekday, boolean>
   airsTime: string
   seasons: ISeason[]
}

export interface IStatus extends IModel {
   name: string
   recordType: string
   keepUpdated: boolean
}

export interface INetwork extends IModel {
   name: string
   slug: string
   abbreviation: string
   country: string
}

export interface IArtwork extends IModel {
   image: string
   thumbnail: string
   type: number
   score: number[]
}

export interface IGenre extends IModel {
   name: string
   slug: string
}

export interface ICharacter extends IModel {
   name: string
   peopleId?: number | string
   seriesId?: number | string
   movieId?: number | string
   episodeId?: number | string
   type: 3
   image: string
   sort: number
   isFeatured: boolean
   url?: string
   nameTranslations?: string
   overviewTranslations?: string
   aliases: null
   person: {
      name: string
      image: string
      score: number
   }
}

export interface ISeason extends IModel {
   seriesId: string | number,
   type: {
      name: string
      type: string
   }
   name: string
   number: number
   image: string
   imageType: number
   network: INetwork
}

export interface IEpisode extends IModel {
   
}