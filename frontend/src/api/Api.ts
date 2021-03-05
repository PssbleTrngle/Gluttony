import { detect } from 'detect-browser'
import { decode } from 'jsonwebtoken'
import querystring from 'query-string'
import Cookies from 'universal-cookie'
import ApiError from "./ApiError"
import EventBus from './EventBus'
import { ITokens, IUser } from './models'

export enum AppStatus {
   LOGGED_IN = 'logged in',
   LOGGED_OUT = 'logged out',
   OFFLINE = 'offline',
   LOADING = 'loading',
}

class Api extends EventBus<{
   user: IUser
   status: AppStatus
}> {

   private token: null | string = null
   private cookies = new Cookies()

   private createReason() {
      const version = detect()
      return version ? `${version.name} / ${version.os}` : 'Unkown'
   }

   constructor(private baseURL: string) {
      super()
      this.refresh().catch(() =>
         this.emit('status', AppStatus.LOGGED_OUT)
      )

      const stored = localStorage.getItem('user')
      if (stored) this.emit('user', JSON.parse(stored))
      this.subscribe('user', u => localStorage.setItem('user', JSON.stringify(u)), false)
   }

   private setToken(token: string) {
      this.token = token
      const data = decode(token) as { user: IUser }
      this.emit('user', data.user)
   }

   async refresh() {
      if (!this.cookies.get('refresh-token')) throw new ApiError('Not logged in', 403)
      const { access_token } = await this.post<ITokens>('auth/refresh')
      this.setToken(access_token)
   }

   async login(username: string, password: string) {
      const reason = this.createReason()
      const { access_token } = await this.post<ITokens>('auth', { username, password, reason })
      this.setToken(access_token)
   }

   logout() {
      return this.delete('auth')
   }

   async request<T>(method: string, endpoint: string, data?: Record<string, any>) {
      const url = `${this.baseURL}/${endpoint}`
      console.count(url)

      const response = await fetch(url, {
         method,
         body: data ? JSON.stringify(data) : undefined,
         headers: {
            Authorization: this.token ? `Bearer ${this.token}` : '',
            'Content-Type': 'application/json'
         }
      })

      const body = await response.json().catch(() => null)

      if (!response.ok) throw new ApiError(body?.error?.message ?? 'An error occures', response.status)

      this.emit('status', this.cookies.get('refresh-token')
         ? AppStatus.LOGGED_IN
         : AppStatus.LOGGED_OUT
      )

      return body as T
   }

   get<T>(endpoint: string, query: Record<string, any> = {}) {
      return this.request<T>('GET', this.appendQuery(endpoint, query))
   }

   appendQuery(endpoint: string, query: Record<string, any>) {
      const q = Object.keys(query).length > 0 ? '?' + querystring.stringify(query) : ''
      return endpoint + q
   }

   post<T>(endpoint: string, data?: object) {
      return this.request<T>('POST', endpoint, data)
   }

   delete<T>(endpoint: string, data?: object) {
      return this.request<T>('DELETE', endpoint, data)
   }

   put<T>(endpoint: string, data?: object) {
      return this.request<T>('PUT', endpoint, data)
   }

}

const API = new Api('/api')

export default API