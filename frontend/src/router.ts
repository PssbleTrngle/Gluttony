import { RouteConfig } from "react-router-config";
import { AppStatus } from "./api/Api";
import Home from "./views/Home";
import Loading from "./views/Loading";
import Login from "./views/Login";

const routes: Record<AppStatus, RouteConfig[]> = {

  [AppStatus.LOGGED_IN]: [
    {
      path: '/',
      component: Home,
    }
  ],

  [AppStatus.LOGGED_OUT]: [
    {
      path: '/',
      component: Login,
    }
  ],

  [AppStatus.OFFLINE]: [
    {
      path: '*',
      component: Loading,
    }
  ],

  [AppStatus.LOADING]: [
    {
      path: '*',
      component: Loading,
    }
  ],

};

export default routes