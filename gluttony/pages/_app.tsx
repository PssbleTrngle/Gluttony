import { AppProps } from "next/app";
import Head from 'next/head';
import { SessionProvider } from "../lib/client";
import { ThemeProvider } from "../lib/themes";

const App = ({ Component, pageProps }: AppProps) => {
   return (
      <SessionProvider>
         <ThemeProvider>

            <Head>
               <title>Gluttony</title>
               <link rel="icon" href="/favicon.ico" />
            </Head>

            <Component {...pageProps} />

         </ThemeProvider>
      </SessionProvider>
   );
};

export default App;