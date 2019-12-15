import React from 'react'
import matter from "gray-matter";
import Link from 'next/link';
import { useRouter } from 'next/router';

import Layout from '../components/layout'
import useHover from '../utils/useHover'

const metadata = require('../site.config').default

const Index = (props) => {

    return <Layout black={true} transparent={true}>
        <div id="background" className="home">
            <div className="container">
                <div className="profile">
                    <img src={metadata.profile.pic} alt="" />
                    <p>
                        {metadata.profile.description}
                    </p>
                </div>
                <div>
                    <div className="post-list">
                        <div className="title is-2 spacer">&nbsp;</div>
                        <div className="title is-2 spacer">&nbsp;</div>
                        <div className="title is-2 spacer">&nbsp;</div>
                        <div className="title is-2 spacer">&nbsp;</div>
                        <div className="title is-2 spacer">&nbsp;</div>
                        {
                            props.posts.map(post =>
                                <Link href={`/story/${post.slug}`}>
                                    <span
                                        dangerouslySetInnerHTML={{ __html: post.document.data.title }}

                                        className="title is-2 is-active"
                                        onMouseEnter={
                                            e => {
                                                let bg = document.getElementById("background")

                                                bg.style.cssText = `
                                            background-image: linear-gradient(to left, 
                                                rgba(245, 246, 252, 0), 
                                                rgba(255, 255, 255, 0.50), 
                                                rgba(255, 255, 255, 1), 
                                                rgba(255, 255, 255, 1)),
                                                url(${post.document.data.hero});
                                            background-size: cover;

                                            `
                                            }
                                        }

                                        onMouseLeave={
                                            e => {
                                                let bg = document.getElementById("background")
                                                let posts = document.getElementsByClassName("post-list")[0]

                                                bg.style.cssText = `
                                            background-image: white;

                                            `
                                            }
                                        }
                                    ></span>
                                </Link>
                            )
                        }
                        <h2 className="title is-2 spacer">&nbsp;</h2>
                        <h2 className="title is-2 spacer">&nbsp;</h2>
                        <h2 className="title is-2 spacer">&nbsp;</h2>
                        <h2 className="title is-2 spacer">&nbsp;</h2>
                        <h2 className="title is-2 spacer">&nbsp;</h2>
                    </div>
                </div>

            </div>
        </div>
        <style jsx>{`
            .container {
                display: flex;
                flex-direction: row;
                width: 100vw;
                padding: 0 100px;
                max-width: 100vw;
                position: absolute;
                top: 50%;
                -ms-transform: translateY(-50%);
                transform: translateY(-50%);
                align-items:center
            }

            #background {
                height: 100vh;
            }
        `}
        </style>
    </Layout >
};

Index.getInitialProps = async function () {
    //get posts & context from folder
    const posts = (context => {
        const keys = context.keys();
        const values = keys.map(context);
        const data = keys.map((key, index) => {
            // Create slug from filename
            const slug = key
                .replace(/^.*[\\\/]/, "")
                .split(".")
                .slice(0, -1)
                .join(".");
            const value = values[index];
            const document = matter(value.default);
            return {
                document,
                slug
            };
        });
        return data;
    })(require.context("../../posts", true, /\.md$/));

    return {
        posts,
    }
}

export default Index;
