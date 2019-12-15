import React from 'react'
import Head from 'next/head'
import Link from 'next/link'

import '../styles/styles.scss'

export default class Layout extends React.Component {

    componentDidMount() {
        const eva = document.createElement("script");
        eva.async = true;
        eva.src = ""
        document.body.appendChild(eva);

        const icons = document.createElement("script")
        icons.innerHTML = `
           eva.replace()
        `
        document.body.appendChild(icons)

        const script = document.createElement("script");

        script.innerHTML = `
        let cursor = document.querySelector('.cursor');
        let crosshair = document.querySelector('.crosshair');

        document.addEventListener('mousemove', e => {
            cursor.setAttribute("style", "top: "+(e.pageY - 10)+"px; left: "+(e.pageX - 10)+"px;")
            crosshair.setAttribute("style", "top: "+(e.pageY - 3)+"px; left: "+(e.pageX - 3)+"px;")
        })

        document.addEventListener('click', () => {
            cursor.classList.add("expand");

            setTimeout(() => {
                cursor.classList.remove("expand");
            }, 500)
        })
        `
        script.id = "cursor"

        if (!document.getElementById("cursor")) {
            document.body.appendChild(script);
        }
    }


    render() {

        const { transparent, children, black } = this.props

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
                    <script src="https://unpkg.com/eva-icons"></script>
                    <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/5.11.2/css/all.min.css" />
                </Head>
                <header>
                    <nav
                        className={`navbar ${transparent && "is-transparent"} is-fixed-top`}
                        role="navigation"
                        aria-label="main navigation"
                        style={{
                            paddingLeft: 100,
                            paddingRight: 100
                        }}>
                        <div className="navbar-brand">
                            <a className="navbar-item" href="/">
                                <h1><i>blinfoldking</i></h1>
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
                            </div>

                            <div className="navbar-end">
                                <div className="navbar-item">
                                    <a href="/" className="navbar-item">Blog</a>
                                    <a href="/?about" className="navbar-item">About</a>
                                    <a href="/" className="navbar-item"><s>Projects</s></a>
                                </div>
                            </div>
                        </div>
                    </nav>
                </header >
                {children}
                <style jsx>
                    {`
                    .navbar-item {
                    ${!black && "color: white;"}  
                    } 

                `}
                </style>
            </div >
        )
    }

} 