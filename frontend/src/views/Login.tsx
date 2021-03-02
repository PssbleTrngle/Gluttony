import { FC, FormEvent, useCallback, useState } from "react";
import API from "../api/Api";

const Login: FC = () => {
   const [username, setUsername] = useState('')
   const [password, setPassword] = useState('')
   const [error, setError] = useState<Error>()

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