require('dotenv').config();

const bcrypt = require('bcryptjs');
const mongoose = require('mongoose');
const { connectDB } = require('../config/db');
const User = require('../models/User');
const Post = require('../models/Post');
const Comment = require('../models/Comment');
const Like = require('../models/Like');
const Follow = require('../models/Follow');

const MINUTE = 60 * 1000;
const HOUR = 60 * MINUTE;
const DAY = 24 * HOUR;

function ago(days, minutes = 0) {
  return new Date(Date.now() - days * DAY - minutes * MINUTE);
}

async function main() {
  const uri = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/northwind_park';
  await connectDB(uri);
  console.log('Seeding Northwind Park…');

  await Promise.all([
    User.deleteMany({}),
    Post.deleteMany({}),
    Comment.deleteMany({}),
    Like.deleteMany({}),
    Follow.deleteMany({}),
  ]);

  // ---- Users (all share the demo password: password-user-12) ----
  const passwordHash = await bcrypt.hash('password-user-12', 10);
  const users = await User.insertMany([
    {
      name: 'Alex Rivera',
      username: 'alex',
      email: 'alex@example.com',
      passwordHash,
      bio: 'CodeAlpha learner. I build with the MERN stack and play chess on Tuesdays.',
      role: 'admin',
    },
    {
      name: 'Jordan Lee',
      username: 'jordan',
      email: 'jordan@example.com',
      passwordHash,
      bio: 'Book club regular. Fantasy novels and long walks in Northwind Park.',
    },
    {
      name: 'Sam Patel',
      username: 'sam',
      email: 'sam@example.com',
      passwordHash,
      bio: 'Weekend basketball at the park courts. Sports stats nerd.',
    },
    {
      name: 'Riley Chen',
      username: 'riley',
      email: 'riley@example.com',
      passwordHash,
      bio: 'Art student sketching around the city. Watercolors and coffee.',
    },
  ]);
  const byUsername = Object.fromEntries(users.map((user) => [user.username, user]));

  // ---- Posts (clubs, books, coding, sports, art) ----
  const postDefs = [
    { author: byUsername.jordan._id, body: 'Finished the third chapter of my fantasy novel draft tonight. Book club, honest notes on the ending please.', createdAt: ago(6) },
    { author: byUsername.alex._id, body: 'Kicked off the CodeAlpha social platform build today. MERN stack, one feature at a time. Small wins add up.', createdAt: ago(5, 30) },
    { author: byUsername.sam._id, body: 'Pickup basketball at the Northwind Park courts, Saturday 9am. All skill levels welcome. We stretch first, promise.', createdAt: ago(5) },
    { author: byUsername.riley._id, body: 'Spent the afternoon sketching the pond in Northwind Park. The light through the oak trees was perfect.', createdAt: ago(4, 45) },
    { author: byUsername.jordan._id, body: "This month's book club pick is a cozy mystery set in a lighthouse. Meetings are Thursdays at the library, 6pm.", createdAt: ago(4) },
    { author: byUsername.alex._id, body: 'Debugging tip of the day: read the error message out loud. Half of my bugs surrender immediately.', createdAt: ago(3, 20) },
    { author: byUsername.riley._id, body: 'The art club is painting a mural on the community center wall next weekend. Wear clothes you can ruin.', createdAt: ago(2, 40) },
    { author: byUsername.sam._id, body: 'Learned the hard way that a 20km bike ride is not the ideal warm-up before a chess match. My brain said no.', createdAt: ago(2) },
    { author: byUsername.alex._id, body: 'The club fair was a blast. Signed up for chess club and the coding club. My calendar finally has a personality.', imageUrl: 'https://picsum.photos/seed/northwind-fair/640/420', createdAt: ago(1, 30) },
    { author: byUsername.jordan._id, body: 'Rainy evening, hot chocolate, and forty pages of my book. Some nights are just built right.', imageUrl: 'https://picsum.photos/seed/northwind-reading/640/420', createdAt: ago(1) },
  ];
  const postDocs = postDefs.map((def) => ({ ...def, updatedAt: def.createdAt }));
  const postResult = await Post.collection.insertMany(postDocs);
  const postIds = postDefs.map((_, index) => postResult.insertedIds[index]);

  // ---- Comments (11, spread across the thread) ----
  const commentDefs = [
    { post: 1, author: 'jordan', body: 'Small wins are the whole game. Keep going.', createdAt: ago(5, 10) },
    { post: 1, author: 'sam', body: 'What stack is the coding club using this term?', createdAt: ago(4, 50) },
    { post: 2, author: 'alex', body: 'I am in, but fair warning: my jump shot is mostly theoretical.', createdAt: ago(4, 55) },
    { post: 2, author: 'riley', body: 'I will bring my sketchbook and draw the winners.', createdAt: ago(4, 40) },
    { post: 3, author: 'jordan', body: 'The pond at golden hour is unbeatable. Post the sketch!', createdAt: ago(4, 20) },
    { post: 3, author: 'sam', body: 'Save a photo of that one for the mural wall.', createdAt: ago(3, 55) },
    { post: 4, author: 'riley', body: 'A lighthouse mystery sounds perfect for autumn.', createdAt: ago(3, 30) },
    { post: 4, author: 'alex', body: 'Count me in for Thursday.', createdAt: ago(3, 10) },
    { post: 5, author: 'sam', body: 'Rubber duck debugging works too. The duck never judges.', createdAt: ago(2, 55) },
    { post: 6, author: 'jordan', body: 'The community mural is going to look amazing.', createdAt: ago(2, 15) },
    { post: 9, author: 'riley', body: 'Forty pages a night keeps the series alive.', createdAt: ago(0, 30) },
  ];
  const commentDocs = commentDefs.map((def) => ({
    author: byUsername[def.author]._id,
    post: postIds[def.post],
    body: def.body,
    createdAt: def.createdAt,
    updatedAt: def.createdAt,
  }));
  await Comment.collection.insertMany(commentDocs);

  // ---- Likes ----
  const likePairs = [
    ['alex', 0], ['alex', 2], ['alex', 4], ['alex', 6],
    ['jordan', 1], ['jordan', 3], ['jordan', 7],
    ['sam', 1], ['sam', 3], ['sam', 5], ['sam', 8],
    ['riley', 0], ['riley', 4], ['riley', 7], ['riley', 9],
  ];
  const likeDocs = likePairs.map(([username, postIndex], index) => ({
    user: byUsername[username]._id,
    post: postIds[postIndex],
    createdAt: ago(1, index * 7),
    updatedAt: ago(1, index * 7),
  }));
  await Like.collection.insertMany(likeDocs);

  // ---- Follow graph (Alex follows Jordan and Sam; Jordan follows Alex) ----
  const followPairs = [
    ['alex', 'jordan'],
    ['alex', 'sam'],
    ['jordan', 'alex'],
    ['riley', 'alex'],
    ['sam', 'jordan'],
  ];
  const followDocs = followPairs.map(([follower, following], index) => ({
    follower: byUsername[follower]._id,
    following: byUsername[following]._id,
    createdAt: ago(3, index * 45),
    updatedAt: ago(3, index * 45),
  }));
  await Follow.collection.insertMany(followDocs);

  // ---- Keep denormalized counters honest ----
  for (let index = 0; index < postIds.length; index += 1) {
    const likeCount = likeDocs.filter((doc) => String(doc.post) === String(postIds[index])).length;
    const commentCount = commentDocs.filter((doc) => String(doc.post) === String(postIds[index])).length;
    await Post.collection.updateOne(
      { _id: postIds[index] },
      { $set: { likeCount, commentCount } }
    );
  }

  console.log('Seed complete:');
  console.log(`  users:    ${users.length} (all use password: password-user-12)`);
  console.log(`  posts:    ${postDocs.length}`);
  console.log(`  comments: ${commentDocs.length}`);
  console.log(`  likes:    ${likeDocs.length}`);
  console.log(`  follows:  ${followDocs.length}`);
  console.log('  seed logins: alex@example.com, jordan@example.com, sam@example.com, riley@example.com');

  await mongoose.disconnect();
}

main().catch((err) => {
  console.error('Seed failed:', err);
  process.exit(1);
});
