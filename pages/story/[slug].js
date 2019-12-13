import * as React from 'react'
import matter from "gray-matter";
import ReactMarkdown from "react-markdown";

import { useCMS, useLocalForm, useWatchFormValues } from "tinacms";

import generateMarkdown from "../../utils/generateMarkdown"

export default function Page(props) {
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
            console.log(data)
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
                        message: `Commit from Tina: Update ${data.title}`
                    });
                });
        }
    });

    useWatchFormValues(form, console.log);

    return (
        <div className="container" style={{
            marginLeft: 100,
            marginRight: 100
        }}>
            <h1>{post.title}</h1>
            <ReactMarkdown source={post.content} />
        </div>
    );
}

Page.getInitialProps = function (ctx) {
    const { slug } = ctx.query;
    let content = require(`../../posts/${slug}.md`);
    let data = matter(content.default);
    console.log(data.content)
    return {
        slug: slug,
        data: data,
        fileRelativePath: `/posts/${slug}.md`,
    };
};
