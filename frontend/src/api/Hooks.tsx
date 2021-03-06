import { config, Promise } from 'bluebird'
import querystring from 'query-string'
import React, { useCallback, useEffect, useMemo, useState } from 'react'
import Cookies from 'universal-cookie'
import ApiError from './ApiError'
import { AppStatus } from './models'
import { useStatus } from './status'
config({ cancellation: true })

const baseURL = '/api'
export const cookies = new Cookies()

async function request<T>(method: string, endpoint: string, body?: string, token?: string) {
   const url = `${baseURL}/${endpoint}`
   console.count(url)

   const response = await fetch(url, {
      method, body, headers: {
         Authorization: token ? `Bearer ${token}` : '',
         'Content-Type': 'application/json'
      }
   })

   const json = await response.json().catch(() => null)

   if (!response.ok) throw new ApiError(json?.error?.message ?? 'An error occures', response.status)

   return json as T
}

export function useApi<M>(endpoint: string, query: Record<string, any> = {}) {
   const [data, setData] = useState<M | undefined>()
   
   const url = useMemo(() => {
      const q = Object.keys(query).length > 0 ? '?' + querystring.stringify(query) : ''
      return endpoint + q
   }, [endpoint, query])

   const { send, error, loading } = useRequest('GET', url, undefined, setData)

   useEffect(() => {
      const promise = send()
      return () => promise.cancel()
   }, [send])

   return [data, loading, error, send] as [M | undefined, boolean, Error | undefined, () => void]
}

type Method = 'POST' | 'PUT' | 'DELETE' | 'GET' | 'HEAD'
export function useRequest<R>(method: Method, endpoint: string, body?: Record<string, any>, onSuccess?: (r: R) => unknown) {
   const [error, setError] = useState<Error>()
   const [loading, setLoading] = useState(false)
   const [, setStatus] = useStatus()

   const encodedBody = body ? JSON.stringify(body) : undefined

   const send = useCallback((e?: React.FormEvent) => {
      setLoading(true)
      setError(undefined)
      e?.preventDefault()

      return Promise.resolve<void>(
         request<R>(method, endpoint, encodedBody)
            .then(r => onSuccess?.(r))
            .then(() => cookies.get('refresh-token') ? AppStatus.LOGGED_IN : AppStatus.LOGGED_OUT)
            .catch(e => {
               setError(e)
               return e.status === 400 ? AppStatus.LOGGED_OUT : AppStatus.OFFLINE
            })
            .then(s => setStatus(s))
            .then(() => setLoading(false))

      )
   }, [encodedBody, method, endpoint, onSuccess, setStatus])

   return { send, error, loading }
}

export function useEvent<K extends keyof WindowEventMap>(type: K, listener: (event: WindowEventMap[K]) => any, options?: boolean | AddEventListenerOptions) {
   useEffect(() => {
      window.addEventListener(type, listener, options)
      return () => window.removeEventListener(type, listener, options)
   }, [type, listener, options])
}