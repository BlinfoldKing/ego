import React from 'react'
import Head from 'next/head'
import Link from 'next/link'
import '../styles/styles.scss'

export default ({ transparent, children }) => {

    const toggleStyles = (event) => {
        document.querySelector('#burger').classList.toggle('is-active')
        document.querySelector('#navbarmenu').classList.toggle('is-active')
    }

    const metadata = require('../site.config').default

    return (
        <div>
            <Head>
                <title>{metadata.title}</title>
                <meta name="viewport" content="initial-scale=1.0, width=device-width" />
            </Head>
            <header>
                <nav
                    className={`navbar ${transparent && "is-transparent"} is-fixed-top`}
                    role="navigation"
                    aria-label="main navigation">
                    <div className="navbar-brand">
                        <a className="navbar-item">
                            <img src="/static/pic.png" />
                        </a>
                        <a id="burger" onClick={toggleStyles}
                            role="button" className="navbar-burger burger" aria-label="menu" aria-expanded="false" data-target="navbarmenu">
                            <span aria-hidden="true"></span>
                            <span aria-hidden="true"></span>
                            <span aria-hidden="true"></span>
                        </a>
                    </div>
                    <div id="navbarmenu" className="navbar-menu">
                        <div className="navbar-start">
                            <Link prefetch href="/">
                                <a className="navbar-item">Home</a>
                            </Link>
                            <Link prefetch href="/elsewhere">
                                <a className="navbar-item">Elsewhere</a>
                            </Link>
                        </div>
                        <div className="navbar-end">
                            <div className="navbar-item">
                                <div className="buttons">
                                    <a onClick={() => alert('You clicked the button!')} className="button is-primary">Click</a>
                                </div>
                            </div>
                        </div>
                    </div>
                </nav>
            </header >
            {children}
            <style jsx>
                {`
                    .navbar-item {
                    ${transparent && "color: white;"}  
                    } 
                `}
            </style>
        </div >
    )
}