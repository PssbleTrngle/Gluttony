import { config, Promise } from 'bluebird'
import React, { useEffect, useMemo, useState } from 'react'
import API from './Api'
config({ cancellation: true })

export function useApi<M>(endpoint: string, query: Record<string, any> = {}) {
   const [data, setData] = useState<M | undefined>()
   const [loading, setLoading] = useState(true)
   const [error, setError] = useState<string | null>()

   const update = useMemo(
      () => () => {
         setError(null)
         return Promise.resolve<M>(API.get<M>(endpoint, query))
            .then(m => setData(m))
            .catch(e => setError(e.message))
            .then(() => setLoading(false))
      },
      [endpoint, query]
   )

   useEffect(() => {
      const promise = update()
      return () => promise.cancel()
   }, [update])

   return [data, loading, error, update] as [M | undefined, boolean, string | null, () => void]
}

export function useSubmit<R>(endpoint: string, body?: Record<string, any>, method: 'POST' | 'PUT' | 'DELETE' = 'POST', onSuccess = (r: R) => {}) {
   const [error, setError] = useState<Error>()
   const [result, setResult] = useState<R>()
   const [loading, setLoading] = useState(false)

   const onSubmit = (e?: React.FormEvent) => {
      setLoading(true)
      setResult(undefined)
      setError(undefined)
      e?.preventDefault()
      const data = typeof body === 'function' ? body() : body
      API.request<R>(method, endpoint, data)
         .then(r => {
            setResult(r)
            onSuccess(r)
         })
         .catch(e => setError({ ...e, message: e.message }))
         .then(() => setLoading(false))
   }

   return { onSubmit, result, error, loading, success: !!result }
}

export function useEvent<K extends keyof WindowEventMap>(type: K, listener: (event: WindowEventMap[K]) => any, options?: boolean | AddEventListenerOptions) {
   useEffect(() => {
      window.addEventListener(type, listener, options)
      return () => window.removeEventListener(type, listener, options)
   }, [type, listener, options])
}
