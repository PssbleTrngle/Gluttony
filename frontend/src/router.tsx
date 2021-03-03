import { RouteConfig } from "react-router-config";
import { Redirect } from "react-router-dom";
import { AppStatus } from "./api/Api";
import Home from "./views/Home";
import Login from "./views/Login";
import Logout from "./views/Logout";
import Tokens from "./views/Tokens";

const redirect = (to: string) => () => <Redirect to={to} />

const ONLINE: RouteConfig[] = [
  {
    path: '/',
    exact: true,
    component: Home,
  },
  {
    path: '*',
    component: redirect('/'),
  }
]

const routes: Record<AppStatus, RouteConfig[]> = {

  [AppStatus.LOGGED_IN]: [
    {
      path: '/logout',
      component: Logout
    },
    {
      path: '/tokens',
      component: Tokens,
    },
    {
      path: '/',
      exact: true,
      component: redirect('/tokens'),
    },
    ...ONLINE
  ],

  [AppStatus.LOGGED_OUT]: [
    {
      path: '/login',
      component: Login,
    },
    ...ONLINE
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