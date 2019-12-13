const generateMarkdown = (frontmatter, content) => {
    let ret =
        `---
title: ${frontmatter.title}
---
${content}
    `

    return ret
}

export default generateMarkdown