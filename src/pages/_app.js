// @flow
import React from 'react';
import App from 'next/app';
import { Tina, TinaCMS } from 'tinacms';
import { GitClient } from '@tinacms/git-client';

import { ApolloProvider } from '@apollo/react-hooks';
import fetch from 'node-fetch';

import withApollo from 'next-with-apollo';
import ApolloClient, { InMemoryCache } from 'apollo-boost';


type Props = {
  token: string
}

class CustomApp extends App {
  cms: TinaCMS;

  apolloClient: ApolloClient;

  constructor(props: Props) {
    super(props);
    this.cms = new TinaCMS();
    const client = new GitClient('http://localhost:3000/___tina');
    this.cms.registerApi('git', client);
  }

  static async getInitialProps(ctx: any) {
    // const cookie = parseCookies(ctx);
    const token = '';
    const appProps = await App.getInitialProps(ctx);

    return { token, ...appProps };
  }

  render() {
    const { Component, pageProps, apollo } = this.props;
    return (
      <ApolloProvider client={apollo}>
        <Tina cms={this.cms} hidden={!pageProps.token ?? true}>
          <Component {...pageProps} />
        </Tina>
      </ApolloProvider>
    );
  }
}

const apolloWrapper = withApollo(
  ({ initialState }) => new ApolloClient({
    // $FlowFixMe
    uri: `${process.env.apiUrl}/graphql`,
    fetch,
    cache: new InMemoryCache().restore(initialState || {}),
  }),
);

export default apolloWrapper(CustomApp);
