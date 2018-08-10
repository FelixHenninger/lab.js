
export const children = (id, tree) => {
  const data = tree[id]
  if (data.children && Array.isArray(data.children)) {
    const nestedIds = data.children.map(c => children(c, tree))
    return data.children.concat(...nestedIds)
  } else {
    return []
  }
}
