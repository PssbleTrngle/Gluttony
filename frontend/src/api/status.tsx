import { createContext, Dispatch, FC, SetStateAction, useContext, useState } from "react";
import { AppStatus } from "./models";

const StatusContext = createContext<[AppStatus, Dispatch<SetStateAction<AppStatus>>]>(
   [AppStatus.OFFLINE, () => console.warn('Trying to use status outside of provider')]
)

export function useStatus() {
   return useContext(StatusContext)
}

export const StatusProvider: FC = ({ children }) => {
   const status = useState<AppStatus>(AppStatus.LOADING)

   return <StatusContext.Provider value={status}>
      {children}
   </StatusContext.Provider>
}