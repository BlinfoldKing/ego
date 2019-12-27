// @flow
import React from 'react';
import nookies from 'nookies';
import Link from 'next/link';
import Router from 'next/router';

import { ClipLoader } from 'react-spinners';

import Layout from '../components/layout';

import metadata from '../site.config';

const apiUrl = process.env.apiUrl ?? '';

type Props = {
  username?: string,
  token?: string,
}

type State = {
  username: string,
  email: string,
  password: string,
  token: string,
  secret: string,
  loading: boolean,
}

export default class Register extends React.Component<Props, State> {
  constructor(props: Props) {
    // $FlowFixMe
    if (process.browser) {
      if (props.token) {
        Router.push('/login');
      }
    }

    super(props);

    this.state = {
      username: '',
      email: '',
      password: '',
      secret: '',
      token: props.token ?? '',
      loading: false,
    };
  }


  static getInitialProps = async (ctx: any) => {
    const cookie = nookies.get(ctx, 'cookie');

    return {
      token: cookie.ego_token,
      username: cookie.ego_username,
    };
  }

  render=() => <Layout
    black={true}
    transparent={true}
  >
    <div className="form">
      <div>
        <span id="logo">EGO</span><span className="version">{metadata.version}</span>
      </div>
      <div>
        <div className="field">
          <p className="control has-icons-left has-icons-right">
            <input className="input" type="text" placeholder="Username" onChange={ (e) => this.setState({ username: e.target.value })}/>
            <span className="icon is-small is-left">
              <i className="fas fa-user"></i>
            </span>
            <span className="icon is-small is-right">
              <i className="fas fa-check"></i>
            </span>
          </p>
        </div>
        <div className="field">
          <p className="control has-icons-left has-icons-right">
            <input className="input" type="email" placeholder="Email" onChange={ (e) => this.setState({ email: e.target.value })}/>
            <span className="icon is-small is-left">
              <i className="fas fa-envelope"></i>
            </span>
            <span className="icon is-small is-right">
              <i className="fas fa-check"></i>
            </span>
          </p>
        </div>
        <div className="field">
          <p className="control has-icons-left">
            <input className="input" type="password" placeholder="Password" onChange={ (e) => this.setState({ password: e.target.value })}/>
            <span className="icon is-small is-left">
              <i className="fas fa-lock"></i>
            </span>
          </p>
        </div>
        <div className="field">
          <p className="control has-icons-left">
            <input className="input" type="password" placeholder="Secret Key" onChange={ (e) => this.setState({ secret: e.target.value })}/>
            <span className="icon is-small is-left">
              <i className="fas fa-key"></i>
            </span>
          </p>
        </div>
        <div className="field">
          <p className="control">
            <div className="control">
              <button className="button is-success" onClick={() => {
                this.setState({ loading: true });
                fetch(`${apiUrl}/auth/register`, {
                  method: 'post',
                  body: JSON.stringify({
                    email: this.state.email,
                    username: this.state.username,
                    password: this.state.password,
                    secret: this.state.secret,
                  }),
                }).then((res) => {
                  this.setState({ loading: false });
                  if (res.status !== 200) {
                    throw new Error(res);
                  }
                  return res.json();
                })
                  .then((res) => {
                    this.setState({ token: res.token });
                    document.cookie = `ego_token=${res.token}; path=/`;
                    document.cookie = `ego_username=${res.username}; path=/`;
                    window.location.reload();
                  }).catch((err) => err);
              }}>
                  Register
              </button>
              <ClipLoader
                size={20}
                css={{ marginTop: 10, marginLeft: 10 }}
                color='#999'
                loading={this.state.loading} />
            </div>
            <Link href="/login">
              <a className="link">click to login</a>
            </Link>
          </p>
        </div>
      </div>
    </div>
    <style jsx>{`
      .form {
        border: solid 1px #c4c4c4;
        padding: 30px;
        border-radius: 5px;
        left: auto;
        right: auto; 
        margin: 30vh auto;
        width: 300px;
      }

      .version {
        font-size: 12px;
      }

      button {
        margin-top: 10px;
      }

      .control {
        display: flex;
        flex-direction: row;
        align-items: center;
        justify-content: space-between;
      }
      
      .link {
        color: #999;
        font-size: 14px;
        margin-left: 30px;
      }

      .link, button {
        display: block
      }
      `}</style>
  </Layout>
}
