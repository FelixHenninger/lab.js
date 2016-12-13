
export const nestedChildren = (id, tree) => {
  const data = tree[id]
  if (data.children && Array.isArray(data.children)) {
    const nestedIds = data.children.map(c => nestedChildren(c, tree))
    return [].concat(...data.children, ...nestedIds)
  } else {
    return []
  }
}
