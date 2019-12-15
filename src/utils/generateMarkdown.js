const generateMarkdown = (frontmatter, content) => {
    let ret =
        `---
${Object.keys(frontmatter).map(key => `${key}: ${frontmatter[key]}`).join('\n')}
---
${content}
    `

    return ret
}

export default generateMarkdown