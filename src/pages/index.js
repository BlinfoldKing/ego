// @flow
import React from 'react';
import matter from 'gray-matter';

import { useCMS, useLocalForm, useWatchFormValues } from 'tinacms';
import { useRouter } from 'next/router';

import Layout from '../components/layout';
import BlogList from '../components/blogList';

import datePrefix from '../utils/datePrefix';
import generateMarkdown from '../utils/generateMarkdown';
import About from '../components/about';

import type { Post } from '../types/post.type';

const metadata = require('../site.config').default;

// const requireContext = require('require-context');

type Props = {
	posts: [Post]
};

const Index = (props: Props) => {
	let cms = useCMS();
	let router = useRouter();
	let [ , form ] = useLocalForm({
		id: 'add-post',
		label: 'Add Post',

		// starting values for the post object
		initialValues: {
			slug: undefined,
			title: undefined
		},

		reset: () => {},

		// field definition
		fields: [
			{
				name: 'slug',
				label: 'Slug',
				component: 'text'
			},
			{
				name: 'title',
				label: 'Title',
				component: 'text'
			}
		],

		// save & commit the file when the "save" button is pressed
		onSubmit(data) {
			const slug = datePrefix(data.slug);
			const filepath = `/posts/${slug}.md`;
			const lastPost = props.posts[props.posts.length - 1];
			const prev =
				props.posts.length > 0
					? {
							prev: lastPost.slug,
							prevTitle: lastPost.document.data.title
						}
					: {};
			return cms.api.git
				.writeToDisk({
					fileRelativePath: filepath,
					content: generateMarkdown(
						{
							title: data.title,
							hero: '',
							...prev
						},
						data.content
					)
				})
				.then(() => {
					if (props.posts.length < 1) {
						return;
					}

					return cms.api.git.writeToDisk({
						fileRelativePath: `posts/${lastPost.slug}.md`,
						content: generateMarkdown(
							{
								...lastPost.document.data,
								next: slug,
								nextTitle: data.title
							},
							lastPost.document.content
						)
					});
				})
				.then(() => {
					return cms.api.git.commit({
						files: [ filepath ],
						message: `New file from Tina: Update ${filepath}`
					});
				})
				.then(() => {
					router.push('/story/' + slug);
				})
				.catch((err) => alert(err));
		}
	});

	useWatchFormValues(form, () => {});

	return (
		<Layout black={true} transparent={true}>
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
								<div className="title is-2 spacer">&nbsp;</div>
								<BlogList posts={props.posts}/>
								<h2 className="title is-2 spacer">&nbsp;</h2>
								<h2 className="title is-2 spacer">&nbsp;</h2>
								<h2 className="title is-2 spacer">&nbsp;</h2>
								<h2 className="title is-2 spacer">&nbsp;</h2>
								<h2 className="title is-2 spacer">&nbsp;</h2>
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

Index.getInitialProps = async function() {
	//get posts & context from folder
	const posts = ((context) => {
		const keys = context.keys();
		const values = keys.map(context);
		const data = keys.map((key, index) => {
			// Create slug from filename
			const slug = key.replace(/^.*[\\/]/, '').split('.').slice(0, -1).join('.');
			const value = values[index];
			const document = matter(value.default);
			return {
				document,
				slug
			};
		});
		return data;
		// $FlowFixMe https://github.com/zeit/next.js/issues/4614
	})(require.context('../../posts', true, /\.md$/));

	return {
		posts: posts.reverse()
	};
};

export default Index;
