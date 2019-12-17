// @flow
import * as React from 'react';
import matter from 'gray-matter';
import ReactMarkdown from 'react-markdown';
import { useState, useEffect } from 'react';
import { useCMS, useLocalForm, useWatchFormValues } from 'tinacms';

import generateMarkdown from '../../utils/generateMarkdown';
import Layout from '../../components/layout';
import Link from 'next/link';

import type { Document } from '../../types/document.type';

type Props = {
	post: Document,
	fileRelativePath: string,
	slug: string
};

function debounce(func, wait = 20, immediate = true) {
	let timeout;
	return function() {
		const context = this;
		const args = arguments;
		const later = function() {
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

	const [ scrollY, setScrollY ] = useState(0);

	useEffect(
		() => {
			const handleScroll = () => setScrollY(window.scrollY);
			window.addEventListener('scroll', debounce(handleScroll));
			return () => window.removeEventListener('scroll', debounce(handleScroll));
		},
		[ debounce ]
	);

	// grab the instance of the cms to access the registered git API
	let cms = useCMS();

	const { post } = props;
	const originalData = post;

	// add a form to the CMS; store form data in `post`
	let [ newPost, form ] = useLocalForm({
		id: props.fileRelativePath, // needs to be unique
		label: 'Edit Post',

		// starting values for the post object
		initialValues: {
			title: post.data.title,
			hero: post.data.hero,
			content: post.content
		},

		// field definition
		fields: [
			{
				name: 'title',
				label: 'Title',
				component: 'text'
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

				uploadDir: () => {
					return '/public/';
				}
			},
			{
				name: 'content',
				component: 'markdown',
				label: 'Post Body',
				description: 'Edit the body of the post here'
			}
		],

		// save & commit the file when the "save" button is pressed
		onSubmit(data) {
			return cms.api.git
				.writeToDisk({
					fileRelativePath: props.fileRelativePath,
					content: generateMarkdown(
						{
							...originalData.data,
							title: data.title,
							hero: data.hero
						},
						data.content
					)
				})
				.then(() => {
					return cms.api.git.commit({
						files: [ props.fileRelativePath ],
						message: `Commit from Tina: Update ${props.fileRelativePath}`
					});
				})
				.catch((err) => alert(err));
		}
	});

	useWatchFormValues(form, () => {});

	let hero = undefined;
	if (newPost.hero) {
		if (newPost.hero.includes('http')) {
			hero = newPost.hero;
		} else {
			hero = `/${newPost.hero}`;
		}
	}

	return (
		<Layout
			transparent={scrollY == 0 || scrollY < window.innerHeight * 0.65}
			black={scrollY >= window.innerHeight * 0.55}
		>
			<div className="header">
				<div className="container">
					<span className="">
						<a href="/">back to home</a>
					</span>
					<h1 className="title is-1" dangerouslySetInnerHTML={{ __html: newPost.title }} />
				</div>
			</div>
			<div className="content container">
				<ReactMarkdown className="post" source={newPost.content} />
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
					background-image: linear-gradient(to bottom, rgba(245, 246, 252, 0), rgba(255, 255, 255, 1)),
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

Page.getInitialProps = function(ctx) {
	const { slug } = ctx.query;
	// $FlowFixMe need to check this later
	let content = require(`../../../posts/${slug}.md`);
	let data = matter(content.default);
	return {
		slug: slug,
		post: data,
		fileRelativePath: `/posts/${slug}.md`
	};
};
