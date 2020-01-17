// @flow
import ReactMarkdown from 'react-markdown';
import React, { useState, useEffect, useCallback } from 'react';
import { useLocalForm, useWatchFormValues } from 'tinacms';
import { useDropzone } from 'react-dropzone';
import { gql, ApolloClient } from 'apollo-boost';
import axios from 'axios';
import { mdToDraftjs, draftjsToMd } from 'draftjs-md-converter';
import { ScaleLoader } from 'react-spinners';

import cookies from 'next-cookies';

import Link from 'next/link';
import Layout from '../../components/layout';

import type { Document } from '../../types/document.type';

import Editor from '../../components/editor';
import CodeBlock from '../../components/codeblock';

import MutationClient from '../../utils/apolloMutationClient';
import formatDate from '../../utils/formatDate';

import './style.scss';

const POST_DETAIL = gql`
query Post($slug: String!){
  post: FindPostBySlug(slug: $slug) {
    id
    title
    slug
    content
    banner
    createdAt
    next {
      title
      slug
    }
    prev {
      title
      slug
    }
  }
}
`;

const POST_UPDATE = gql`
mutation Post($id: Uuid!, $title: String, $content: String, $banner: String) {
  post: UpdatePostById(id: $id, updatePostInput: {
    title: $title
    content: $content,
    banner: $banner
  }) {
    id
    title
    content
    banner
  }
}
`;

const uploadFile = async (files: any) => {
  const formData = new FormData();

  files.forEach((file, i) => {
    formData.append(`${i}`, file);
  });

  const ret = await axios.request({
    method: 'post',
    // $FlowFixMe
    url: `${window.location.origin}/image-upload`,
    headers: { 'Content-Type': 'multipart/form-data' },
    data: formData,
  }).then((res) => {
    const image = res.data[0];
    return image.url;
  });

  return ret;
};

type Props = {
    post: Document,
    fileRelativePath: string,
    slug: string,
    token?: string,
    username: string,
    post: any,
    apolloClient: ApolloClient
};



export default function Page(props: Props) {
  if (typeof window === 'undefined') {
    global.window = {};
  }

  const [scrollY, setScrollY] = useState(0);

  useEffect(() => {
    const handleScroll = () => setScrollY(window.scrollY);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // grab the instance of the cms to access the registered git API
  const { post } = props;

  // post.createdAt = new Date(post.createdAt);
  // console.log(post.createdAt);
  const [newPost, form] = useLocalForm({
    id: post.id, // needs to be unique
    label: 'Edit Post',

    // starting values for the post object
    initialValues: {
      title: post.title,
      banner: post.banner,
      content: mdToDraftjs(post.content),
      unlockContent: false,
    },

    // field definition
    fields: [
      {
        name: 'title',
        label: 'Title',
        component: 'text',
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
      MutationClient(props.token ?? '').mutate({
        mutation: POST_UPDATE,
        variables: {
          content,
          title: data.title,
          id: props.post.id,
          banner: data.banner,
        },
      })
        .then(() => {
          alert('save success');
          window.location.reload();
        })
        // TODO: need to be change into snackbar
        // eslint-disable-next-line no-alert
        .catch((err) => alert(err));
    },

    reset: () => {

    },
  });


  // add a form to the CMS; store form data in `post`
  useWatchFormValues(form, () => {
  });


  const [files, setFiles] = useState([]);
  const [upload, setUpload] = useState(false);

  const onDrop = useCallback(async (acceptedFiles) => {
    // set preview
    // upload file
    setFiles([]);
    setUpload(true);
    const imageUrl = await uploadFile(acceptedFiles);
    setUpload(false);
    setFiles(acceptedFiles.map((file) => Object.assign(file, {
      preview: imageUrl,
    })));
  }, []);

  if (files.length > 0) {
    form.finalForm.change('banner', files[0].preview);
  }

  const {
    getRootProps,
    getInputProps,
    isDragActive,
  } = useDropzone({ onDrop });

  return (
    <Layout
      transparent={scrollY === 0 || scrollY < window.innerHeight * 0.65}
      black={scrollY >= window.innerHeight * 0.55}
    >
      <div className="header">
        <div className="header-overlay"></div>
        { newPost.unlockContent
          && <div className="file-uploader container" {...getRootProps()}>
            <input {...getInputProps()} />
            <div className="uploader-desc">
              {
                isDragActive
                  ? <p>Drop the files here ...</p>
                  // eslint-disable-next-line react/no-unescaped-entities
                  : <p>Drag 'n' drop some files here, or click to select files</p>
              }
            </div>
            <div className="loader-container">
              <ScaleLoader color="#3273dc" loading={upload}/>
            </div>
          </div>
        }
        <div className="container">
          <span> {
            post.createdAt
            && <div className="subtitle" >
              {formatDate(post.createdAt)}
            </div>
          }</span>
          <div className="title-container">
            <h1
              className="title is-1"
              dangerouslySetInnerHTML={{ __html: newPost.title }}
            />

          </div>
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
          {post.prev && (
            <div>
              <div>
                <Link href={`/story/${post.prev.slug}`}>
                  <a>Prev</a>
                </Link>
              </div>
              <span>{post.prev.title}</span>
            </div>
          )}
        </div>
        <div className="next">
          {post.next && (
            <div>
              <div>
                <Link href={`/story/${post.next.slug}`}>
                  <a>Next</a>
                </Link>
              </div>
              <span>{post.next.title}</span>
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
                    background-attachment: fixed;
                    background-size: cover;
                    background-position: center;
                    background-image: url(${files[0] ? files[0].preview : newPost.banner});
                    display: flex;
                    align-items: flex-end;
                }

           `}</style>
    </Layout>
  );
}

Page.getInitialProps = async (ctx) => {
  const { slug } = ctx.query;
  const { apolloClient } = ctx;

  const cookie = cookies(ctx);

  const { data } = await apolloClient.query({
    query: POST_DETAIL,
    variables: {
      slug,
    },
    fetchPolicy: 'network-only',
  });

  return {
    slug,
    post: data.post,
    token: cookie.ego_token,
    username: cookie.ego_username,
  };
};
