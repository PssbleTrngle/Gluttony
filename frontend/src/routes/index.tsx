import { RouteConfig } from "react-router-config";
import { Redirect } from "react-router-dom";
import { AppStatus } from "../api/models";
import loggedIn from "./loggedIn";
import loggedOut from "./loggedOut";
import online from "./online";

export function redirect(to: string) {
   return () => <Redirect to={to} />
}

const routes: Record<AppStatus, RouteConfig[]> = {

   [AppStatus.LOGGED_IN]: [
      ...loggedIn,
      ...online,
   ],

   [AppStatus.LOGGED_OUT]: [
      ...loggedOut,
      ...online
   ],

   [AppStatus.OFFLINE]: [
      {
         path: '*',
         component: () => <p>Server offline :/</p>,
      }
   ],

   [AppStatus.LOADING]: [
      {
         path: '*',
         component: () => <p>...</p>,
      }
   ],

};

export default routes