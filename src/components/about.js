import React from 'react';

const metadata = require('../site.config').default

const bg = `

`

const About = (props) => (
    <div onMouseEnter={e => {

        document
            .getElementById("background")
            .style.cssText = bg
    }}>
        <h1 className="title is-1">About Me</h1>
        <p>
            {metadata.profile.description}
        </p>
        <div className="social-media">
            <a target="__blank" href={metadata.profile.social.github}>
                <i class="fab fa-github-square" style={{ fontSize: 30 }}></i>
            </a>
            <a target="__blank" href={metadata.profile.social.linkedin}>
                <i class="fab fa-linkedin" style={{ fontSize: 30 }}></i>
            </a>
            <a target="__blank" href={metadata.profile.social.email}>
                <i class="fas fa-envelope-square" style={{ fontSize: 30 }}></i>
            </a>

        </div>
        <style jsx>
            {`
            p {
                max-width: 30vw;
                margin-bottom: 30px;
            }
            a {
                color: inherit;
                margin: 15px;
            }

            h1 {
                color: white;
                width: 100vw;
                background: linear-gradient(to right, #333, #222, #22222222, #11111100);
            }
            `}
        </style>
    </div>
)

export default About