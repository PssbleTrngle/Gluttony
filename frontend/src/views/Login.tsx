import { FC, useState } from "react";
import { useLogin, useUser } from "../api/session";

const Login: FC = () => {
   const user = useUser()
   const [username, setUsername] = useState(user?.username ?? '')
   const [password, setPassword] = useState('')
   const { error, login } = useLogin(username, password)

   return <form onSubmit={login}>
      {error && <p>{error.message}</p>}
      <input required type='text' placeholder='Username' value={username} onChange={e => setUsername(e.target.value)} autoComplete='username' />
      <input required type='password' placeholder='Password' value={password} onChange={e => setPassword(e.target.value)} autoComplete='current-password' />
      <button>Login</button>
   </form>
}

export default Login