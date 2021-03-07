import { detect } from "detect-browser";
import { decode } from "jsonwebtoken";
import { createContext, Dispatch, FC, SetStateAction, useCallback, useContext, useEffect, useMemo, useState } from "react";
import ApiError from "./ApiError";
import { useRequest } from "./hooks";
import { AppStatus, ITokens, IUser } from "./models";
import { useStatus } from "./status";

interface Session {
   user?: IUser
   token?: string
}

const CONTEXT = createContext<[Session, Dispatch<SetStateAction<Session>>]>([{}, () => { }])

export function useUser() {
   const [session] = useContext(CONTEXT)
   return session.user
}


export function useLogin(username: string, password: string) {
   const [, setSession] = useContext(CONTEXT)

   const setToken = useCallback((token: string) => {
      const data = decode(token) as { user?: IUser }
      setSession({ token, user: data?.user })
   }, [setSession])

   const reason = useMemo(() => {
      const version = detect()
      return version ? `${version.name} / ${version.os}` : 'Unkown'
   }, [])

   const { error, send, loading } = useRequest<ITokens>('POST', 'auth', { username, password, reason }, t => setToken(t.access_token))
   return { error, login: send, loading }
}

export const SessionProvider: FC = ({ children }) => {
   const savedUser = localStorage.getItem('user')
   const [session, setSession] = useState<Session>({ user: savedUser ? JSON.parse(savedUser) : undefined })
   const [, setStatus] = useStatus()

   useEffect(() => {
      if (session.user) localStorage.setItem('user', JSON.stringify(session.user))
   }, [session])

   const setToken = useCallback((token: string) => {
      const data = decode(token) as { user?: IUser }
      setSession({ token, user: data?.user })
   }, [setSession])

   const {send: refresh, error} = useRequest<ITokens>('POST', 'auth/refresh', undefined, t => setToken(t.access_token))

   useEffect(() => {
      refresh()
   }, [])

   useEffect(() => {
      if(error instanceof ApiError && error.status === 400) {
         setStatus(AppStatus.LOGGED_OUT)
      }
   }, [error])

   return <CONTEXT.Provider value={[session, setSession]}>
      {children}
   </CONTEXT.Provider>
}