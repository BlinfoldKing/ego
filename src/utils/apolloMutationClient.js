// @flow
import ApolloClient from 'apollo-boost';
import fetch from 'node-fetch';

export default (token: string) => new ApolloClient({
  // $FlowFixMe
  uri: `${process.env.apiUrl}/graphql`,
  fetch,

  request: (operation) => {
    operation.setContext({
      headers: {
        Authorization: token,
      },
    });
  },
});
