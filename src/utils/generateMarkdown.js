const generateMarkdown = (frontmatter, content) => {
    let ret =
        `---
title: ${frontmatter.title}
hero: ${frontmatter.hero}
---
${content}
    `

    return ret
}

export default generateMarkdown