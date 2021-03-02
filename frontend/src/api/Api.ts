import querystring from 'query-string'
import Cookies from 'universal-cookie'
import ApiError from "./ApiError"

export enum AppStatus {
   LOGGED_IN = 'logged in',
   LOGGED_OUT = 'logged out',
   OFFLINE = 'offline',
   LOADING = 'loading',
}

interface Tokens {
   refresh_token: string
   access_token: string
}

type Subscriber<T> = (value: T) => unknown

class Api {

   private token: null | string = null
   private cookies = new Cookies()

   private subscibers = new Set<Subscriber<AppStatus>>()
   private current = AppStatus.LOADING;

   constructor(private baseURL: string) {
      if (this.cookies.get('refresh_token')) this.refresh()
      else this.setStatus(AppStatus.LOGGED_OUT)
   }

   private setStatus(status: AppStatus) {
      this.current = status;
      this.subscibers.forEach(s => s(status))
   }

   subscribe(sub: Subscriber<AppStatus>) {
      this.subscibers.add(sub)
      sub(this.current)
      return () => {
         this.subscibers.delete(sub)
      }
   }

   refresh() {
      this.post<Tokens>('auth/refresh')
         .then(({ access_token }) => this.token = access_token)
         .catch(e => console.error(e))
   }

   login(username: string, password: string) {
      return this.post<Tokens>('auth', { username, password })
         .then(({ access_token, refresh_token }) => {
            this.token = access_token
            this.cookies.set('refresh_token', refresh_token)
         })
   }

   async request<T>(method: string, endpoint: string, data?: Record<string, any>) {
      const url = `${this.baseURL}/${endpoint}`

      const response = await fetch(url, {
         method,
         body: data ? JSON.stringify(data) : undefined,
         headers: {
            Authorization: this.token ? `Token ${this.token}` : '',
            'Content-Type': 'application/json'
         }
      })

      const body = await response.json().catch(() => null)
      if (!response.ok) throw new ApiError(body?.error?.message ?? 'An error occures', response.status)
      return body as T
   }

   get<T>(endpoint: string, query: Record<string, any> = {}) {
      const q = Object.keys(query).length > 0 ? '?' + querystring.stringify(query) : ''
      return this.request<T>('GET', endpoint + q)
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