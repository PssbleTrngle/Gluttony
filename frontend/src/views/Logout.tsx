import { FC, useEffect } from "react";
import { useRequest } from "../api/hooks";

const Logout: FC = () => {

   const { send } = useRequest('DELETE', 'auth')

   useEffect(() => {
      send()
   })

   return <p>Logging out...</p>
}

export default Logout