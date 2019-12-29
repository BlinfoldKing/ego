// @flow
import React from 'react';
import type { Node } from 'react';
import Head from 'next/head';
import '../styles/styles.scss';

import Link from 'next/link';

import { parseCookies } from 'nookies';

import metadata from '../site.config';

type Props = {
  transparent: boolean,
  children: Node,
  black: boolean,
};

export default class Layout extends React.Component<Props> {
  username: string

  componentDidMount() {
    this.username = parseCookies().ego_username;
  }

  render() {
    const { transparent, children, black } = this.props;
    // TODO: used later for responsive
    // const toggleStyles = () => {
    // const burger = document.querySelector('#burger');
    // if (burger) burger.classList.toggle('is-active');
    // const navbar = document.querySelector('#navbarmenu');
    // if (navbar) navbar.classList.toggle('is-active');
    // };


    return (
      <div>
        <Head>
          <title>{metadata.title}-{metadata.version}</title>
          <meta name="viewport" content="initial-scale=1.0, width=device-width" />
          <script src="https://unpkg.com/eva-icons" />
          <link
            rel="stylesheet"
            href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/5.11.2/css/all.min.css"
          />
        </Head>
        <header>
          <nav
            className={`navbar ${transparent ? 'is-transparent' : ''} is-fixed-top`}
            role="navigation"
            aria-label="main navigation"
            style={{
              paddingLeft: 100,
              paddingRight: 100,
            }}
          >
            <div className="navbar-brand">
              <Link href="/">
                <a className="navbar-item">
                  <h1 id="logo">EGO</h1><span className="version">{metadata.version}</span>
                </a>
              </Link>
              {/* <Link>
                  <a
                    id="burger"
                    onClick={toggleStyles}
                    role="button"
                    className="navbar-burger burger"
                    aria-label="menu"
                    aria-expanded="false"
                    data-target="navbarmenu"
                  >
                    <span aria-hidden="true" />
                    <span aria-hidden="true" />
                    <span aria-hidden="true" />
                  </a>
                </Link> */}
            </div>
            <div id="navbarmenu" className="navbar-menu">
              <div className="navbar-start" />

              <div className="navbar-end">
                <Link href="/">
                  <a className="navbar-item">Blog</a>
                </Link>
                <Link href="/?about=show">
                  <a className="navbar-item">About</a>
                </Link>
                <Link href="">
                  <a disabled className=" disabled navbar-item">
                    <s>Projects</s>
                  </a>
                </Link>
                {
                  this.username
                  && <Link href="/login">
                    <a className="navbar-item"><strong>{this.username}</strong></a>
                  </Link>
                }
              </div>
            </div>
          </nav>
        </header>
        {children}
        <footer>
          <div className="foot-note" id="footer">
            made with 🔥 by <a href="https://github.com/blinfoldking">blinfoldking</a>
          </div>
        </footer>
        <style jsx>
          {`
            .navbar-item {
              ${!black ? 'color: white;' : ''};
            }
            .version {
              font-size: 16px
            }
         `}
        </style>

      </div>
    );
  }
}
