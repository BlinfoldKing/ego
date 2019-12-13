import * as React from "react";
import { useCMS, useLocalForm, useWatchFormValues } from "tinacms";

export default function Page(props) {
    // grab the instance of the cms to access the registered git API
    let cms = useCMS();

    // add a form to the CMS; store form data in `post`
    let [post, form] = useLocalForm({
        id: props.fileRelativePath, // needs to be unique
        label: "Edit Post",

        // starting values for the post object
        initialValues: {
            title: props.title
        },

        // field definition
        fields: [
            {
                name: "title",
                label: "Title",
                component: "text"
            }
        ],

        // save & commit the file when the "save" button is pressed
        onSubmit(data) {
            console.log(data)
            return cms.api.git
                .writeToDisk({
                    fileRelativePath: props.fileRelativePath,
                    content: JSON.stringify({ title: data.title })
                })
                .then(() => {
                    return cms.api.git.commit({
                        files: [props.fileRelativePath],
                        message: `Commit from Tina: Update ${data.title}`
                    });
                });
        }
    });

    let writeToDisk = React.useCallback(formState => {
        cms.api.git.writeToDisk({
            fileRelativePath: props.fileRelativePath,
            content: JSON.stringify({ title: formState.values.title })
        });
    }, []);

    useWatchFormValues(form, writeToDisk);

    return (
        <>
            <h1>{post.title}</h1>
        </>
    );
}

Page.getInitialProps = function(ctx) {
    const { slug } = ctx.query;
    let content = require(`../posts/${slug}.json`);

    return {
        slug: slug,
        fileRelativePath: `/posts/${slug}.json`,
        title: content.title
    };
};
