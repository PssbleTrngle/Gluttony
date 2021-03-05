import { detect } from "detect-browser"
import { decode } from "jsonwebtoken"
import { createContext, Dispatch, FC, FormEvent, SetStateAction, useCallback, useContext, useMemo, useState } from "react"
import Cookies from 'universal-cookie'
import { ITokens, IUser } from "./models"

const cookies = new Cookies()

class ApiError extends Error {
   constructor(public readonly status: number, message: string) {
      super(message)
   }
}

export interface Session {
   user?: IUser
   token?: string
}

const context = createContext<[Session, Dispatch<SetStateAction<Session>>]>([{}, () => { }])

export const SessionProvider: FC = ({ children }) => {
   const session = useState<Session>({})

   return <context.Provider value={session} >
      {children}
   </context.Provider>
}

export function useSession() {
   return useContext(context)
}

type Method = 'POST' | 'PUT' | 'DELETE' | 'HEAD' | 'GET'

async function request<R>(method: Method, endpoint: string, token?: string, body?: string) {

   const url = `/api/${endpoint}`
   const response = await fetch(url, {
      method, body,
      headers: {
         'Authorization': token ? `Bearer ${token}` : '',
         'Content-Type': 'application/json',
      }
   })

   const json = await response.json().catch(() => null)

   if (response.ok) {
      return json as R
   } else {
      throw new ApiError(response.status, json?.error?.message ?? 'An error occured')
   }
}

export function useRequest<R>(method: Method, endpoint: string, body: Record<string, any> = {}) {
   const [error, setError] = useState<Error>()
   const [loading, setLoading] = useState(false)

   const [session] = useSession()

   const encodedBody = body ? JSON.stringify(body) : undefined

   const send = useCallback(async (e?: FormEvent) => {
      const { token } = session
      e?.preventDefault()

      setLoading(true)
      setError(undefined)

      try {
         return request<R>(method, endpoint, token, encodedBody)
      } catch (e) {
         setError(e)
      } finally {
         setLoading(false)
      }
   }, [endpoint, encodedBody, session])

   return { send, loading, error }

}

export function useLogin(username: string, password: string) {
   const [, setSession] = useSession()

   const reason = useMemo(() => {
      const version = detect()
      return version ? `${version.name} / ${version.os}` : 'Unkown'
   }, [])

   const { error, send } = useRequest<ITokens>('POST', 'auth', { username, password, reason })
   const login = useCallback((e: FormEvent) => send(e).then(tokens => {
      if (tokens) {
         const { access_token, refresh_token } = tokens
         const { user } = decode(access_token) as { user?: IUser }
         setSession({ user, token: access_token })
         cookies.set('refresh-token', refresh_token)
         console.log(tokens, user)
      }
   }), [send])

   return { login, error }
}