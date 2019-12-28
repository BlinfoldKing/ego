// @flow
import React, { useState } from 'react';
import Link from 'next/link';
import ReactMarkdown from 'react-markdown';

import { useQuery } from '@apollo/react-hooks';
import { gql } from 'apollo-boost';


import './blogList.scss';


import type { Node } from 'react';

const POST_LIST = gql`
  {
    posts: GetAllPosts(limit: 10, offset: 0) {
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
  const { loading, error, data } = useQuery(POST_LIST, {
    fetchPolicy: 'network-only',
  });

  const [selectedPost, setPost] = useState('');

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
  if (!loading && !error) {
    return <div>
      {data.posts.map<any>(renderPost)}
    </div>;
  }
  return <div>
    {/* skeleton component */}
  </div>;
};

export default BlogList;
