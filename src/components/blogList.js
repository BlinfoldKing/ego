// @flow
import React from 'react';
import Link from 'next/link';

import type {Node} from 'react';
import type { Post } from '../types/post.type';

type Props = {
	posts: [Post]
};

const activeStyle = (post) => `
background-image: linear-gradient(to left, 
rgba(245, 246, 252, 0), 
rgba(255, 255, 255, 0.50), 
rgba(255, 255, 255, 1), 
rgba(255, 255, 255, 1)),
url(${post.document.data.hero});
background-size: cover;
`;

const regularStyle = `
background-image: white;
`;

const handleEnter = (post) => () => {
	let bg = document.getElementById('background');
	if (bg) bg.style.cssText = activeStyle(post);
};

const hanldeLeave = () => {
	let bg = document.getElementById('background');
	if (bg) bg.style.cssText = regularStyle;
};

const BlogList = (props: Props) => {
	const { posts } = props;
	const renderPost = (post, index): Node => (
		<Link href={`/story/${post.slug}`} key={index}>
			<a>
				<span
					dangerouslySetInnerHTML={{ __html: post.document.data.title }}
					className="title is-2 is-active"
					onMouseEnter={handleEnter(post)}
					onMouseLeave={hanldeLeave}
				/>
			</a>
		</Link>
	);
	return posts.map<any>(renderPost);
};

export default BlogList;
