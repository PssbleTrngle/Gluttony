import { createContext, FC, useContext, useEffect, useState } from "react";
import API, { AppStatus } from "./Api";

const StatusContext = createContext<AppStatus>(AppStatus.OFFLINE)

export function useStatus() {
   return useContext(StatusContext)
}

export const StatusProvider: FC = ({children}) => {
  const [status, setStatus] = useState<AppStatus>(AppStatus.LOADING)
  useEffect(() => API.subscribe(setStatus), [])

  return <StatusContext.Provider value={status}>
     {children}
  </StatusContext.Provider>
}