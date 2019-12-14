import * as React from 'react'
import matter from "gray-matter";
import ReactMarkdown from "react-markdown";
import { useState, useEffect } from "react";

import { useCMS, useLocalForm, useWatchFormValues } from "tinacms";

import generateMarkdown from "../../utils/generateMarkdown"
import Layout from '../../components/layout'

function debounce(func, wait = 20, immediate = true) {
    let timeout;
    return function () {
        const context = this;
        const args = arguments;
        const later = function () {
            timeout = null;
            if (!immediate) func.apply(context, args);
        };
        const callNow = immediate && !timeout;
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
        if (callNow) func.apply(context, args);
    };
}

export default function Page(props) {

    if (typeof window === 'undefined') {
        global.window = {}
    }

    const [scrollY, setScrollY] = useState(0);

    useEffect(
        () => {
            const handleScroll = () => setScrollY(window.scrollY);
            window.addEventListener("scroll", debounce(handleScroll));
            return () => window.removeEventListener("scroll", debounce(handleScroll));
        },
        [debounce]
    );

    // grab the instance of the cms to access the registered git API
    let cms = useCMS();

    const { data } = props

    // add a form to the CMS; store form data in `post`
    let [post, form] = useLocalForm({
        id: props.fileRelativePath, // needs to be unique
        label: "Edit Post",

        // starting values for the post object
        initialValues: {
            title: data.data.title,
            content: data.content
        },

        // field definition
        fields: [
            {
                name: "title",
                label: "Title",
                component: "text"
            },
            {
                name: 'content',
                component: 'markdown',
                label: 'Post Body',
                description: 'Edit the body of the post here',
            },
        ],

        // save & commit the file when the "save" button is pressed
        onSubmit(data) {
            return cms.api.git
                .writeToDisk({
                    fileRelativePath: props.fileRelativePath,
                    content: generateMarkdown({
                        title: data.title
                    }, data.content)
                })
                .then(() => {
                    return cms.api.git.commit({
                        files: [props.fileRelativePath],
                        message: `Commit from Tina: Update ${data.fileRelativePath}`
                    });
                })
                .catch(err => console.log(err));
        }
    });

    useWatchFormValues(form, () => { });

    return (
        <Layout transparent={scrollY == 0 || scrollY < window.innerHeight * 0.6}>
            <div className="header">
                <div className="container">
                    <span className=""><a href="/">back to home</a></span>
                    <h1 className="title is-1">{post.title}</h1>
                </div>
            </div>
            <div className="content container">
                <ReactMarkdown className="post" source={post.content} />
            </div>
            <style jsx>{`
                .header {
                    height: 70vh;
                    background-image: linear-gradient(to bottom, rgba(245, 246, 252, 0), rgba(255, 255, 255, 1)),
url(${data.data.hero});
                    background-size: cover;
                    display: flex;
                    align-items: flex-end;
                }

                .header a {
                    font-size: 20px;
                }

                h1.title.is-1 {
                    font-size: 60px;
                }

                .header .container {
                    padding: 0 290px;
                }

                .content {
                    padding: 100px 300px;
                    padding-top: 50px;
                }
               `}</style>
        </Layout>
    );
}

Page.getInitialProps = function (ctx) {
    const { slug } = ctx.query;
    let content = require(`../../../posts/${slug}.md`);
    let data = matter(content.default);
    return {
        slug: slug,
        data: data,
        fileRelativePath: `/posts/${slug}.md`,
    };
};
