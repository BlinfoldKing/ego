// @flow
import React from 'react';
import './style.scss';

const metadata = require('../../site.config').default;

const About = () => (
  <div id="about">
    <h1 className="title is-1">About Me</h1>
    <p>{metadata.profile.description}</p>
    <div className="social-media">
      <a target="__blank" href={metadata.profile.social.github}>
        <i className="fab fa-github-square" style={{ fontSize: 30 }} />
      </a>
      <a target="__blank" href={metadata.profile.social.linkedin}>
        <i className="fab fa-linkedin" style={{ fontSize: 30 }} />
      </a>
      <a target="__blank" href={metadata.profile.social.email}>
        <i className="fas fa-envelope-square" style={{ fontSize: 30 }} />
      </a>
    </div>
    <div className="timeline">
      <ul>
        {metadata.profile.experience.map((xp, i) => (
          <li key={i}>
            <div>
              <strong>
             &gt; {xp.title}
              </strong>
            </div>
            <div className="date">
              <a href={xp.org_url}>{xp.org}</a>| <i>{xp.period}</i>
            </div>
          </li>
        ))}
      </ul>
    </div>
  </div>
);

export default About;
