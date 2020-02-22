// @flow
import React, { useState } from 'react';
import Link from 'next/link';
import ReactMarkdown from 'react-markdown';

import { useQuery } from '@apollo/react-hooks';
import { gql } from 'apollo-boost';


import './blogList.scss';


import type { Node } from 'react';

const PAGINATION_LIMIT = 3;
const WAIT_INTERVAL = 900;

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
url(https://res.cloudinary.com/dnm7mbocc/image/fetch/${post.banner});
background-size: cover;
`;


const BlogList = () => {
  const [selectedPost, setPost] = useState('');
  const [query, setQuery] = useState('');
  const [isLastPage, setPage] = useState(false);
  const [timer, updateTimer] = useState(undefined);

  const {
    loading, error, data, fetchMore,
  } = useQuery(POST_LIST, {
    fetchPolicy: 'network-only',
    variables: {
      limit: PAGINATION_LIMIT,
      offset: 0,
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
        <div className="preview-content">
          <ReactMarkdown source={post.preview} />
        </div>
        <div>
          <Link href={`/story/${post.slug}`}>Read More</Link>
        </div>
      </p>
    </div>
  );

  const handleSearch = () => {
    setPage(false);

    // if (timer) {
    //   clearTimeout(timer);
    // }

    if (timer) {
      updateTimer(
        setTimeout(() => {
          fetchMore({
            variables: {
              offset: data.posts.length || 0,
              query,
            },
            updateQuery: (prev, { fetchMoreResult }) => ({
              ...prev,
              posts: [...fetchMoreResult.posts],
            }),
          });
        }, WAIT_INTERVAL),
      );
    }
  };


  return <div id="post-list">
    <div className="field omnisearch">
      <p className="control has-icons-left">
        <input className="input is-rounded" type="text" placeholder="Search Post"
          onChange={(e) => {
            setQuery(e.target.value);
            handleSearch();
          }}
        />
        <span className="icon is-small is-left">
          <i className="fas fa-search"></i>
        </span>
      </p>
    </div>
    <div style={{ minHeight: 300 }}>
      {!loading && !error
        && <div>
          {data.posts.map<any>(renderPost)}
        </div>
      }
      { !isLastPage && (!loading && !error && data.posts.length > 0
        ? <a href="#">
          <span
            onClick={() => {
              fetchMore({
                variables: {
                  offset: data.posts.length,
                  limit: PAGINATION_LIMIT,
                  query,
                },
                updateQuery: (prev, { fetchMoreResult }) => {
                  if (fetchMoreResult.posts.length > 0) {
                    return {
                      ...prev,
                      posts: [...prev.posts, ...fetchMoreResult.posts],
                    };
                  }

                  setPage(true);
                  return prev;
                },
              });
            }}
            className="title is-2 end is-active load-more-button">
            <i className="fas fa-angle-double-down"></i>
            &nbsp;Load More
          </span>
        </a>
        : (!loading && data.posts.length === 0 && <div>
          <h1 className="title is-1"> No Post Found :(( </h1>
          <div>
            <div>
              <a href="#" onClick={() => handleSearch()}>Try Again</a>
            </div>
          </div>
        </div>))
      }
      { isLastPage && <div className="end">end of posts</div>}
    </div>
  </div>;
};

export default BlogList;
