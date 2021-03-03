import { FC, useEffect } from "react";
import API from "../api/Api";

const Logout: FC = () => {

   useEffect(() => {
      API.delete('auth')
         .catch(e => console.error(e))
   })

   return <p>Logging out...</p>
}

export default Logout