import axios from 'axios'
import Cache from 'node-cache'
import config from './config'

interface Show {
   id: string
   tvdb_id: string
   slug: string
   name: string
   country?: string
   director?: string
   extended_title: string
   image_url: string
   network?: string
   overview?: string
   type: 'movie' | 'series'
   year: string
   status?: string
}

class Api {
   private cache = new Cache()
   private token: string | null = null

   constructor() {
      const events = ['set', 'del', 'expired', 'flush']
      events.map(e => this.cache.on(e, key => console.log(`${e}(${key})`)))
   }

   private request = axios.create({ baseURL: config.tvdb.url })

   async login() {
      const { data } = await this.request.post('login', { apikey: config.tvdb.key })
      if (data.status !== 'success') throw new Error('Unable to login into TVDB API')
      this.token = data.data.token
   }

   async fetch<T>(endpoint: string) {
      try {
         const response = await this.request.get<{ data: T }>(endpoint, {
            headers: {
               Authorization: this.token ? `Bearer ${this.token}` : undefined,
            },
         })
         return response.data.data
      } catch (e) {
         throw new Error(e.message)
      }
   }

   async cacheOr<T>(key: string, getter: () => Promise<T>): Promise<T> {
      const cached = this.cache.get<T>(key)
      if (cached) return cached

      const data = await getter()
      this.cache.set(key, data)
      return data
   }

   async findShow(name: string) {
      return this.cacheOr(`show/${name}`, async () => {
         const results = await this.fetch<Show[]>(`/search?type=series&query=${name}`)
         console.log(results.map(r => r.name))
         if (results.length) return await this.fetch<Show>(`/series/${results[0].tvdb_id}`)
      })
   }
}

const api = new Api()
export default api
