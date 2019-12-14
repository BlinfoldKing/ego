import React from 'react'
import matter from "gray-matter";
import Link from 'next/link';
import { useRouter } from 'next/router';

import Layout from '../components/layout'
import useHover from '../utils/useHover'

const metadata = require('../site.config').default

const Index = (props) => {
    const router = useRouter()

    console.log(router.query.story)


    return <Layout>
        <div className=" home">
            <div className="container">
                <div className="profile">
                    <img src={metadata.profile.pic} alt="" />
                    <p>
                        {metadata.profile.description}
                    </p>
                </div>
                <div className="post-list">
                    {
                        props.posts.map(post =>
                            <Link href={`/story/${post.slug}`}>
                                <h2 className="title is-2 is-active">{post.document.data.title}</h2>
                            </Link>
                        )
                    }
                </div>
            </div>
        </div>
        <style jsx>{`
            .container {
                display: flex;
                flex-direction: row;
                width: 100vw;
                padding: 100px;
                max-width: 100vw;
                position: absolute;
                top: 50%;
                -ms-transform: translateY(-50%);
                transform: translateY(-50%);
                align-items:center
            }
        `}
        </style>
    </Layout>
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
