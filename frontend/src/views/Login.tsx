import { FC, FormEvent, useCallback, useEffect, useState } from "react";
import API from "../api/Api";
import { useUser } from "../api/hooks";

const Login: FC = () => {
   const user = useUser()
   const [username, setUsername] = useState('')
   const [password, setPassword] = useState('')
   const [error, setError] = useState<Error>()
   
   useEffect(() => {
      if(user) setUsername(user.username)
   }, [user])

   const login = useCallback((e: FormEvent) => {
      e.preventDefault()
      API.login(username, password).catch(setError)
   }, [username, password])

   return <form onSubmit={login}>
      {error && <p>{error.message}</p>}
      <input required type='text' placeholder='Username' value={username} onChange={e => setUsername(e.target.value)} autoComplete='username' />
      <input required type='password' placeholder='Password' value={password} onChange={e => setPassword(e.target.value)} autoComplete='current-password' />
      <button>Login</button>
   </form>
}

export default Login