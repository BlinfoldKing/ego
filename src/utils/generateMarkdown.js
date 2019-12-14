const generateMarkdown = (frontmatter, content) => {
    let ret =
        `---
hero: https://images.unsplash.com/photo-1451188214936-ec16af5ca155?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=crop&w=1400&q=80
title: ${frontmatter.title}
---
${content}
    `

    return ret
}

export default generateMarkdown