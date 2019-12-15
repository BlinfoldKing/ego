import Link from 'next/link';

const activeStyle = post => `
background-image: linear-gradient(to left, 
rgba(245, 246, 252, 0), 
rgba(255, 255, 255, 0.50), 
rgba(255, 255, 255, 1), 
rgba(255, 255, 255, 1)),
url(${post.document.data.hero});
background-size: cover;
`

const regularStyle = `
background-image: white;
`

const handleEnter = post => _ => {
    let bg = document.getElementById("background")
    bg.style.cssText = activeStyle(post)
}

const hanldeLeave = _ => {
    let bg = document.getElementById("background")
    bg.style.cssText = regularStyle
}

const BlogList = posts => {
    return posts.reverse().map((post, i) =>
        <Link href={`/story/${post.slug}`} key={i}>
            <span
                dangerouslySetInnerHTML={{ __html: post.document.data.title }}

                className="title is-2 is-active"
                onMouseEnter={handleEnter(post)}

                onMouseLeave={hanldeLeave}
            ></span>
        </Link>
    )
}

export default BlogList