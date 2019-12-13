import React from 'react'
import matter from "gray-matter";
import Layout from '../components/layout'

const Index = (props) => (
    <Layout>
        <div>
            {props.posts.map(post =>
                <a href={`/story/${post.slug}`}>
                    <h2 className="title is-2">{post.document.data.title}</h2>
                </a>
            )}
        </div>
    </Layout>
);

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
        console.log(data)
        return data;
    })(require.context("../posts", true, /\.md$/));

    return {
        posts,
    }
}

export default Index;
