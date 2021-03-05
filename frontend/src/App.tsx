/** @jsxImportSource @emotion/react */
import { css, Theme } from '@emotion/react';
import { FC } from 'react';
import { renderRoutes } from "react-router-config";
import { BrowserRouter as Router } from 'react-router-dom';
import { StatusProvider, useStatus } from './api/status';
import StatusBanner from './components/StatusBanner';
import routes from './router';
import { ThemeProvider } from './themes';

const App: FC = () => (
  <Providers>
    <Container />
  </Providers>
)

const Container: FC = () => {
  const status = useStatus()

  const style = (t: Theme) => css`
      background: ${t.bg};
      color: ${t.text};
      min-height: 100vh;
      font-family: sans-serif;

      input {
        color: ${t.text};
      }
  `

  return <div css={style}>
    <Router>
      <StatusBanner />
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
