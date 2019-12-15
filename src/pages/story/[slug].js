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
            hero: data.data.hero,
            content: data.content,
        },

        // field definition
        fields: [
            {
                name: "title",
                label: "Title",
                component: "text"
            },
            {
                name: "hero",
                label: "Thumbnail",
                component: "image",
                parse: filename => `${filename}`,

                previewSrc: (formValues, { input }) => {
                    if (formValues.hero == "" || formValues.hero.includes("http")) {
                        return formValues.hero
                    }

                    return `/${formValues.hero}`
                },

                uploadDir: () => {
                    return "/public/"
                },
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
            console.log(data)
            return cms.api.git
                .writeToDisk({
                    fileRelativePath: props.fileRelativePath,
                    content: generateMarkdown({
                        title: data.title,
                        hero: data.hero
                    }, data.content)
                })
                .then(() => {
                    return cms.api.git.commit({
                        files: [props.fileRelativePath],
                        message: `Commit from Tina: Update ${props.fileRelativePath}`
                    });
                })
                .catch(err => console.log(err));
        }
    });

    useWatchFormValues(form, (input) => {
    });

    let hero = undefined
    if (post.hero) {
        if (post.hero.includes("http")) {
            hero = post.hero
        } else {
            hero = `/${post.hero}`
        }
    }


    return (
        <Layout
            transparent={scrollY == 0 || scrollY < window.innerHeight * 0.65}
            black={scrollY >= window.innerHeight * 0.65}>
            <div className="header">
                <div className="container">
                    <span className=""><a href="/">back to home</a></span>
                    <h1
                        className="title is-1"
                        dangerouslySetInnerHTML={{ __html: post.title }}
                    ></h1>
                </div>
            </div>
            <div className="content container">
                <ReactMarkdown className="post" source={post.content} />
            </div>
            <div className="top">
                <a href="#"><i data-eva="arrowhead-up"></i></a>
            </div>
            <style jsx>{`
                .header {
                    height: 70vh;
                    background-image: linear-gradient(to bottom, rgba(245, 246, 252, 0), rgba(255, 255, 255, 1)),
url(${hero || data.data.hero});
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
                    padding: 0 20vw;
                }

                .content {
                    padding: 20vw 20vw;
                    padding-top: 50px;
                }

                .top {
                    position: fixed;
                    right: 200px;
                    bottom: 100px;
                    padding: 10px;
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
