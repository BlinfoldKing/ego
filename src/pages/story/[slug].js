// @flow
import matter from 'gray-matter';
import ReactMarkdown from 'react-markdown';
import React, { useState, useEffect } from 'react';
import { useCMS, useLocalForm, useWatchFormValues } from 'tinacms';

import { mdToDraftjs, draftjsToMd } from 'draftjs-md-converter';

import nookies from 'nookies';

import Link from 'next/link';
import generateMarkdown from '../../utils/generateMarkdown';
import Layout from '../../components/layout';

import type { Document } from '../../types/document.type';

import Editor from '../../components/editor';
import CodeBlock from '../../components/codeblock';

type Props = {
    post: Document,
    fileRelativePath: string,
    slug: string,
    token?: string,
    username: string
};

function debounce(func, wait = 20, immediate = true) {
  let timeout;
  return () => {
    const context = this;
    // eslint-disable-next-line prefer-rest-params
    const args = arguments;
    const later = () => {
      timeout = null;
      if (!immediate) func.apply(context, args);
    };
    const callNow = immediate && !timeout;
    clearTimeout(timeout);
    timeout = setTimeout(later, wait);
    if (callNow) func.apply(context, args);
  };
}

export default function Page(props: Props) {
  if (typeof window === 'undefined') {
    global.window = {};
  }

  const [scrollY, setScrollY] = useState(0);

  useEffect(() => {
    const handleScroll = () => setScrollY(window.scrollY);
    window.addEventListener('scroll', debounce(handleScroll));
    return () => window.removeEventListener('scroll', debounce(handleScroll));
  }, [debounce]);

  // grab the instance of the cms to access the registered git API
  const cms = useCMS();

  const { post } = props;
  const originalData = post;

  // add a form to the CMS; store form data in `post`
  const [newPost, form] = useLocalForm({
    id: props.fileRelativePath, // needs to be unique
    label: 'Edit Post',

    // starting values for the post object
    initialValues: {
      title: post.data.title,
      hero: post.data.hero,
      content: mdToDraftjs(post.content),
    },

    // field definition
    fields: [
      {
        name: 'title',
        label: 'Title',
        component: 'text',
      },
      {
        name: 'hero',
        label: 'Thumbnail',
        component: 'image',
        parse: (filename) => `${filename}`,

        previewSrc: (formValues) => {
          if (formValues.hero) {
            if (!formValues.hero.includes('http')) {
              return `/${formValues.hero}`;
            }
          }

          return formValues.hero;
        },

        uploadDir: () => '/public/',
      },
      {
        name: 'unlockContent',
        component: 'toggle',
        label: 'Content Editting',
        description: 'Enable to unlock content editing ',
      },
    ],


    // save & commit the file when the "save" button is pressed
    onSubmit(data) {
      const content = draftjsToMd(data.content);
      return cms.api.git
        .writeToDisk({
          fileRelativePath: props.fileRelativePath,
          content: generateMarkdown(
            {
              ...originalData.data,
              title: data.title,
              hero: data.hero,
            },
            content,
          ),
        })
        .then(() => cms.api.git.commit({
          files: [props.fileRelativePath],
          message: `Commit from Tina: Update ${props.fileRelativePath}`,
        }))
        .then(() => window.location.reload())
        // TODO: need to be change into snackbar
        // eslint-disable-next-line no-alert
        .catch((err) => alert(err));
    },

    reset: () => {

    },
  });

  useWatchFormValues(form, () => {
  });

  let hero;
  if (newPost.hero) {
    if (newPost.hero.includes('http')) {
      hero = newPost.hero;
    } else {
      hero = `/${newPost.hero}`;
    }
  }

  return (
    <Layout
      transparent={scrollY === 0 || scrollY < window.innerHeight * 0.65}
      black={scrollY >= window.innerHeight * 0.55}
    >
      <div className="header">
        <div className="container">
          <span className="">
            <a href="/">back to home</a>
          </span>
          <h1
            className="title is-1"
            dangerouslySetInnerHTML={{ __html: newPost.title }}
          />
        </div>
      </div>
      <div className="content container">
        {!newPost.unlockContent
          ? <ReactMarkdown
            className="post"
            renderers={{ code: CodeBlock }}
            source={
              post.content
            } />
          : (form
         && <Editor
           meta={{}}
           field={{ name: '', label: '' }}
           input={{ name: '', value: newPost.content, onChange: (e) => form.finalForm.change('content', e) }}/>
          )
        }

      </div>
      <div className="container post-navigator">
        <div className="prev">
          {post.data.prev && (
            <div>
              <div>
                <Link href={`/story/${post.data.prev}`}>
                  <a>Prev</a>
                </Link>
              </div>
              <span>{post.data.prevTitle}</span>
            </div>
          )}
        </div>
        <div className="next">
          {post.data.next && (
            <div>
              <div>
                <Link href={`/story/${post.data.next}`}>
                  <a>Next</a>
                </Link>
              </div>
              <span>{post.data.nextTitle}</span>
            </div>
          )}
        </div>
      </div>
      <div className="top">
        <a href="#">
          <i data-eva="arrowhead-up" />
        </a>
      </div>
      <style jsx>{`
                .header {
                    height: 60vh;
                    background-image: linear-gradient(
                            to bottom,
                            rgba(245, 246, 252, 0),
                            rgba(255, 255, 255, 1)
                        ),
                        url(${hero || post.data.hero});
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
                    padding: 0 10vw;
                }

                .content {
                    padding: 50px 10vw;
                }

                .top {
                    position: fixed;
                    right: 10vw;
                    bottom: 100px;
                    padding: 10px;
                }

                .post-navigator {
                    display: flex;
                    padding: 50px 10vw;
                    justify-content: space-between;
                }

                .post-navigator span {
                    font-size: 20px;
                    vertical-align: text-bottom;
                }

                .next {
                    text-align: right;
                }

                .prev {
                    text-align: left;
                }
            `}</style>
    </Layout>
  );
}

Page.getInitialProps = (ctx) => {
  const { slug } = ctx.query;
  // $FlowFixMe
  const content = require(`../../../posts/${slug}.md`); // eslint-disable-line import/no-dynamic-require, global-require
  const data = matter(content.default);

  const cookie = nookies.get(ctx, 'cookie');

  return {
    slug,
    post: data,
    fileRelativePath: `/posts/${slug}.md`,
    token: cookie.ego_token,
    username: cookie.ego_username,
  };
};
