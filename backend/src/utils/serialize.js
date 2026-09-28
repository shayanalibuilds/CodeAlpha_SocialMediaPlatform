const Like = require('../models/Like');

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

// Adds likedByMe for the current viewer in one batched query.
async function withViewerState(posts, viewerId) {
  const list = Array.isArray(posts) ? posts : [posts];
  const ids = list.map((post) => post._id);

  const likedSet = new Set();
  if (viewerId && ids.length) {
    const likes = await Like.find({ user: viewerId, post: { $in: ids } }).select('post');
    for (const like of likes) likedSet.add(String(like.post));
  }

  return list.map((post) => ({ ...publicPost(post), likedByMe: likedSet.has(String(post._id)) }));
}

module.exports = { publicAuthor, publicPost, publicComment, withViewerState };
