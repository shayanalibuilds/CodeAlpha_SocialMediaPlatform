function publicAuthor(author) {
  if (!author) {
    return { id: null, name: 'Unknown', username: 'unknown', bio: '', avatarUrl: '' };
  }
  if (typeof author.toPublic === 'function') return author.toPublic();
  return {
    id: author._id,
    name: author.name,
    username: author.username,
    bio: author.bio || '',
    avatarUrl: author.avatarUrl || '',
  };
}

function publicPost(post) {
  return {
    id: post._id,
    body: post.body,
    imageUrl: post.imageUrl,
    likeCount: post.likeCount,
    commentCount: post.commentCount,
    createdAt: post.createdAt,
    author: publicAuthor(post.author),
  };
}

function publicComment(comment) {
  return {
    id: comment._id,
    body: comment.body,
    createdAt: comment.createdAt,
    author: publicAuthor(comment.author),
  };
}

module.exports = { publicAuthor, publicPost, publicComment };
