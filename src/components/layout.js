// @flow
import React from 'react';
import type { Node } from 'react';
import Head from 'next/head';

import '../styles/styles.scss';
import Link from 'next/link';

type Props = {
	transparent: boolean,
	children: Node,
	black: boolean
};

export default class Layout extends React.Component<Props> {
	componentDidMount() {
		const eva = document.createElement('script');
		eva.async = true;
		eva.src = '';
		const body = document.body;

		const icons = document.createElement('script');
		icons.innerHTML = `
           eva.replace()
        `;

		const script = document.createElement('script');

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
        `;
		script.id = 'cursor';

		if (body) {
			body.appendChild(eva);
			if (!document.getElementById('cursor')) {
				// body.appendChild(script);
			}
		}
	}

	render() {
		const { transparent, children, black } = this.props;

		// TODO: used later for responsive
		// const toggleStyles = () => {
		// 	const burger = document.querySelector('#burger');
		// 	if (burger) burger.classList.toggle('is-active');
		// 	const navbar = document.querySelector('#navbarmenu');
		// 	if (navbar) navbar.classList.toggle('is-active');
		// };

		const metadata = require('../site.config').default;

		return (
			<div>
				<Head>
					<title>{metadata.title}</title>
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
							paddingRight: 100
						}}
					>
						<div className="navbar-brand">
							<Link href="/">
								<a className="navbar-item">
									<h1 id="logo">EGO</h1>
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
							</div>
						</div>
					</nav>
				</header>
				{children}
				<style jsx>
					{`
						.navbar-item {
							${!black ? 'color: white;' : ''};
						}
					`}
				</style>
			</div>
		);
	}
}
