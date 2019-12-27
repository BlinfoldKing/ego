// @flow
import React from 'react';
import App from 'next/app';
import { Tina, TinaCMS } from 'tinacms';
import { GitClient } from '@tinacms/git-client';

class CustomApp extends App {
  cms: TinaCMS;

  constructor() {
    super();
    this.cms = new TinaCMS();
    const client = new GitClient('http://localhost:3000/___tina');
    this.cms.registerApi('git', client);
  }

  render() {
    const { Component, pageProps } = this.props;
    return (
      <Tina cms={this.cms} hidden={!pageProps.token}>
        <Component {...pageProps} />
      </Tina>
    );
  }
}

export default CustomApp;
