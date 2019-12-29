// @flow
import React from 'react';

import { useLocalForm, useWatchFormValues } from 'tinacms';
import { useRouter } from 'next/router';

import { gql } from 'apollo-boost';
import cookies from 'next-cookies';

import Layout from '../components/layout';
import BlogList from '../components/blogList';

import About from '../components/about';

import type { Post } from '../types/post.type';

import MutationClient from '../utils/apolloMutationClient';

const metadata = require('../site.config').default;

// const requireContext = require('require-context');

type Props = {
    posts: [Post],
    token?: string,
    username?: string
};

const Index = (props: Props) => {
  const router = useRouter();
  const [, form] = useLocalForm({
    id: 'add-post',
    label: 'Add Post',

    // starting values for the post object
    initialValues: {
      slug: undefined,
      title: undefined,
      platinaTest: undefined,
    },

    reset: () => {},

    // field definition
    fields: [
      {
        name: 'slug',
        label: 'Slug',
        component: 'text',
      },
      {
        name: 'title',
        label: 'Title',
        component: 'text',
      },
    ],

    // save & commit the file when the "save" button is pressed
    onSubmit(data) {
      MutationClient(props.token ?? '').mutate({
        mutation: gql`
              mutation CreatePost($title: String!, $slug: String) {
                post: CreatePost(createPostInput:{
                  title: $title
                  slug: $slug
                  content: ""
                  isDraft: true
                }) {
                  slug
                }
              }
            `,
        variables: {
          title: data.title,
          slug: data.slug,
        },
      })
        .then((res) => {
          router.push(`/story/${res.data.post.slug}`);
        })
        // eslint-disable-next-line no-alert
        .catch((err) => alert(err));
    },
  });

  useWatchFormValues(form, () => {});

  return (
    <Layout black={true} transparent={false}>
      <div id="background" className="home">
        <div className="container">
          <div className="profile">
            <img src={metadata.profile.pic} alt="" />
            <p>{metadata.profile.tagline}</p>
          </div>
          <div>
            {!router.query.about ? (
              <div className="post-list">
                <div className="title is-2 spacer">&nbsp;</div>
                <div className="title is-2 spacer">&nbsp;</div>
                <div className="title is-2 spacer">&nbsp;</div>
                <div className="title is-2 spacer">&nbsp;</div>
                <BlogList posts={props.posts} />
                <div className="title is-2 spacer">&nbsp;</div>
                <div className="title is-2 spacer">&nbsp;</div>
                <div className="title is-2 spacer">&nbsp;</div>
                <div className="title is-2 spacer">&nbsp;</div>
                <div className="title is-2 spacer">&nbsp;</div>
                <div className="title is-2 spacer">&nbsp;</div>
              </div>
            ) : (
              <About />
            )}


          </div>
        </div>
      </div>
      <style jsx>
        {`
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
                        align-items: center;
                    }

                    #background {
                        height: 100vh;
                    }
                `}
      </style>
    </Layout>
  );
};

Index.getInitialProps = async (ctx) => {
  const { ego_token: token, ego_username: username } = cookies(ctx);

  return {
    posts: [],
    token,
    username,
  };
};

export default Index;
