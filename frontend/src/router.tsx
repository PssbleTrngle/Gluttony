import { RouteConfig } from "react-router-config";
import { Redirect } from "react-router-dom";
import { AppStatus } from "./api/models";
import Home from "./views/Home";
import Login from "./views/Login";
import Logout from "./views/Logout";
import Profile from "./views/Profile";
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
      path: '/profile',
      component: Profile,
    },
    {
      path: '/',
      exact: true,
      component: redirect('/profile'),
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