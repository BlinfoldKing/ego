export default str => {
    const d = new Date()
    const year = d.getUTCFullYear()
    const month = d.getUTCMonth() + 1
    const date = d.getUTCDate()
    const hour = d.getUTCHours()
    const minute = d.getUTCMinutes()

    return `${year}${month}${date}${hour}${minute}-${str}`
}