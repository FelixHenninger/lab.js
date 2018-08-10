
export const children = (id, tree) => {
  const data = tree[id]
  if (data.children && Array.isArray(data.children)) {
    const nestedIds = data.children.map(c => children(c, tree))
    return data.children.concat(...nestedIds)
  } else {
    return []
  }
}

export const parents = (target, tree) => {
  const immediateParents = Object.entries(tree)
    .filter(
      ([id, data]) =>
        data.children && Array.isArray(data.children) &&
        data.children.includes(target)
    ).map(
      ([id, data]) => id
    )

  return immediateParents.concat(
    ...immediateParents.map(n => parents(n, tree))
  )
}
