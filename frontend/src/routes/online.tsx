import { RouteConfig } from "react-router-config"
import { redirect } from "."
import Home from "../views/Home"
import Show from "../views/Show"

const routes: RouteConfig[] = [
   {
     path: '/',
     exact: true,
     component: Home,
   },
   {
     path: '/shows/:id',
     component: Show,
   },
   {
     path: '*',
     component: redirect('/'),
   }
 ]

 export default routes