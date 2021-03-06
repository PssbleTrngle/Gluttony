import { FC } from "react";
import { Link } from "react-router-dom";
import { AppStatus } from "../api/models";
import { useUser } from "../api/session";
import { useStatus } from "../api/status";

const Home: FC = () => {
   const user = useUser()
   const [status] = useStatus()

   if(status === AppStatus.LOGGED_IN) return <p>Welcome {user?.username}!</p>
   else return <Link to='/login'>Login</Link>
}

export default Home