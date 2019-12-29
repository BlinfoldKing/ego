// @flow
import React, { useState } from 'react';
import Link from 'next/link';
import ReactMarkdown from 'react-markdown';

import { useQuery } from '@apollo/react-hooks';
import { gql } from 'apollo-boost';


import './blogList.scss';


import type { Node } from 'react';

const POST_LIST = gql`
  query GetAllPosts($query: String!, $limit: Int!, $offset: Int!) {
    posts: SearchPostByTitle(query: $query, limit: $limit, offset: $offset) {
      title
      slug
      banner
      preview
    }
  }
`;

const passiveStyle = `
background-image: white;
`;
const activeStyle = (post) => `
background-image: linear-gradient(to left, 
rgba(245, 246, 252, 0), 
rgba(255, 255, 255, 0.50), 
rgba(255, 255, 255, 1), 
rgba(255, 255, 255, 1)),
url(${post.banner});
background-size: cover;
`;


const BlogList = () => {
  const [selectedPost, setPost] = useState('');
  const [query, setQuery] = useState('');
  const [pagination, setPage] = useState({
    limit: 10,
    offset: 0,
  });

  const {
    loading, error, data, fetchMore,
  } = useQuery(POST_LIST, {
    fetchPolicy: 'network-only',
    variables: {
      limit: pagination.limit,
      offset: pagination.offset,
      query,
    },
  });

  const renderPost = (post): Node => (
    <div
      key={post.slug}
      id={post.slug}
    >
      {/* <Link href={`/story/${post.slug}`} key={index}> */}
      <a>
        <span
          dangerouslySetInnerHTML={{ __html: post.title }}
          className={`title is-2 is-active ${selectedPost === post.slug ? 'selected' : ''}`}
          onClick={() => {
            if (selectedPost !== post.slug) {
              setPost(post.slug);
              const bg = document.getElementById('background');
              if (bg) bg.style.cssText = activeStyle(post);
            } else {
              setPost('');
              const bg = document.getElementById('background');
              if (bg) bg.style.cssText = passiveStyle;
            }
          }}

        />
      </a>
      {/* </Link> */}
      <p className={ `preview ${selectedPost === post.slug ? '' : 'hide'}` }>
        <ReactMarkdown source={post.preview} />
        <div>
          <Link href={`/story/${post.slug}`}>Read More</Link>
        </div>
      </p>
    </div>

  );

  let content = <div></div>;
  if (!loading && !error && data.posts.length > 0) {
    content = <div>
      {data.posts.map<any>(renderPost)}
    </div>;
  }
  return <div id="post-list">
    <div className="field omnisearch">
      <p className="control has-icons-left">
        <input className="input is-rounded" type="text" placeholder="Search Post"
          onChange={((e) => {
            setQuery(e.target.value);
            fetchMore({
              variables: {
                offset: pagination.offset,
                query,
              },
              updateQuery: (prev, { fetchMoreResult }) => ({
                ...prev,
                posts: [...fetchMoreResult.posts],
              }),
            });
          })
          }
        />
        <span className="icon is-small is-left">
          <i className="fas fa-search"></i>
        </span>
      </p>
    </div>
    <div style={{ minHeight: 300 }}>
      {content}
      { !loading && !error && data.posts.length > 0
        ? <a href="#footer">
          <span
            onClick={() => {
              setPage({
                limit: pagination.limit,
                offset: (pagination.limit * (pagination.offset + 1)) + 1,
              });

              fetchMore({
                variables: {
                  offset: pagination.offset,
                  query,
                },
                updateQuery: (prev, { fetchMoreResult }) => ({
                  ...prev,
                  posts: [...fetchMoreResult.posts, ...prev.posts],
                }),
              });
            }}
            className="title is-2 is-active">
            <i>Load More</i>
          </span>
        </a>
        : (!loading && <div>
          <h1 className="title is-1"> No Post Found :( </h1>
          <div>
            <div>
              <Link href="#">
                <a href="#">Try Again</a>
              </Link>
            </div>
          </div>
        </div>)
      }

    </div>
  </div>;
};

export default BlogList;
