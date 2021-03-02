import React, { FC } from 'react';
import { renderRoutes } from "react-router-config";
import { BrowserRouter as Router } from 'react-router-dom';
import { StatusProvider, useStatus } from './api/status';
import routes from './router';
import { ThemeProvider, useStyles } from './themes';

const App: FC = () => (
  <Providers>
    <Container />
  </Providers>
)

const Container: FC = () => {

  const status = useStatus()
  console.log(status)

  const style = useStyles(({ bg, text }) => `
    background: ${bg};
    color: ${text};
    min-height: 100vh;
  `)

  return <div className={style}>
    <Router>
      {renderRoutes(routes[status])}
    </Router>
  </div>
}

const Providers: FC = ({ children }) => (
  <StatusProvider>
    <ThemeProvider>
      {children}
    </ThemeProvider>
  </StatusProvider>
)

export default App;
