import { RouteConfig } from "react-router-config";
import { redirect } from ".";
import Logout from "../views/Logout";
import Profile from "../views/Profile";
import Sessions from "../views/Sessions";

const routes: RouteConfig[] = [
   {
     path: '/logout',
     component: Logout
   },
   {
     path: '/sessions',
     component: Sessions,
   },
   {
     path: '/profile',
     component: Profile,
   },
   {
     path: '/',
     exact: true,
     component: redirect('/profile'),
   },
 ]

 export default routes