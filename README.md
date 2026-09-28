# Northwind Park

**CodeAlpha Full Stack Development Internship — Task 2: Social Media Platform**

A small, family-safe social app built with the MERN stack. People create profiles,
share short updates, comment, like, and follow each other. Seed content is clubs,
books, coding, sports, and art — no dating, no DMs, no ads, no pricing.

**Author:** Shayan Ali Jalbani (@shayanalibuilds)

## Stack

- **MongoDB + Mongoose** — data layer (User, Follow, Post, Like, Comment)
- **Express + Node.js** — REST API with JWT Bearer auth and server-side validation
- **React 18 + Vite** — single-page frontend
- **Tailwind CSS** — responsive, mobile-first styling

## Features

- Register and log in with email or username (JWT Bearer, bcrypt-hashed passwords, min length 8)
- Unique lowercase usernames; editable profile with name, bio, and avatar URL
- Home feed of your posts plus people you follow, newest first
- Explore page with all public posts; guests can browse without an account
- Posts up to 280 characters with an optional image URL; authors (and the admin seed user) can delete
- Idempotent likes — double-like never double-counts; unlike removes the row
- Comment threads up to 300 characters; only the author can delete a comment
- Two-sided follow graph (followers/following) with a unique pair index; you cannot follow yourself
- Empty states that guide you (the feed asks you to follow someone)
- Responsive layout, usable at narrow widths; all user text is escaped by React (no `dangerouslySetInnerHTML`)

## Image URLs only. No file-upload vendor.

Posts and avatars take an image URL string. There is no S3, Cloudinary, or any
file-upload service in this project.

## Seed logins

All seed users share the password **password-user-12**.

| Email | Username | Name | Notes |
|---|---|---|---|
| alex@example.com | alex | Alex Rivera | follows jordan and sam; admin (may delete any post) |
| jordan@example.com | jordan | Jordan Lee | follows alex |
| sam@example.com | sam | Sam Patel | follows jordan |
| riley@example.com | riley | Riley Chen | follows alex |

The seed also creates 10 posts, 11 comments, 15 likes, and 5 follow edges so
every page has content on first run.

## How to run

Prerequisites: Node.js 18+ and a local MongoDB on `127.0.0.1:27017`.

### Backend

```bash
cd backend
cp .env.example .env      # PORT=5001, MONGO_URI, JWT_SECRET, CLIENT_ORIGIN
npm install
npm run seed
npm run dev               # API on http://127.0.0.1:5001
```

Sanity check:

```bash
curl http://127.0.0.1:5001/api/posts?scope=explore
```

### Frontend

```bash
cd frontend
npm install
npm run dev               # App on http://127.0.0.1:5173
```

### Tests

```bash
cd backend
npm test                  # Jest + Supertest on an in-memory MongoDB
cd ../frontend
npm run build             # Production build check
```

## API

Base URL: `http://127.0.0.1:5001/api`. Auth endpoints return a JWT; send it as
`Authorization: Bearer <token>`. Writes always use the JWT user — the client
never picks the acting userId.

| Method | Path | Auth | Description |
|---|---|---|---|
| POST | /auth/register | — | Create an account `{ name, username, email, password }` |
| POST | /auth/login | — | Log in with email or username, returns token |
| GET | /auth/me | yes | Current user |
| POST | /auth/logout | — | Acknowledges logout (client clears the token) |
| GET | /users/:username | — | Public profile with post/follower/following counts |
| PATCH | /users/me | yes | Edit `{ name?, bio?, avatarUrl? }` (URL string only) |
| GET | /users/:username/followers | — | List of followers |
| GET | /users/:username/following | — | List of who they follow |
| POST | /users/:username/follow | yes | Follow (cannot follow yourself; unknown user 404) |
| DELETE | /users/:username/follow | yes | Unfollow |
| GET | /posts | — | `?scope=feed\|explore&page=`; feed requires login; optional `?author=username` |
| POST | /posts | yes | Create `{ body, imageUrl? }`; body 1–280 chars |
| GET | /posts/:id | — | One post with author |
| DELETE | /posts/:id | yes | Author only (admin seed user may delete any post) |
| POST | /posts/:id/like | yes | Like — idempotent |
| DELETE | /posts/:id/like | yes | Unlike — idempotent |
| GET | /posts/:id/comments | — | Comment thread, oldest first |
| POST | /posts/:id/comments | yes | Comment `{ body }`; 1–300 chars |
| DELETE | /comments/:id | yes | Comment author only |

## Project structure

```
backend/
  src/
    config/       db connection
    models/       User, Follow, Post, Like, Comment
    middleware/   JWT auth (required + optional), error handler
    routes/       thin routers
    controllers/  request logic and server-side validation
    seed/         demo data loader
    utils/        tokens, validators, serializers
  tests/          Jest + Supertest suite (in-memory MongoDB)
frontend/
  src/
    api/          fetch client with token handling
    components/   post cards, forms, avatars, follow button, lists
    pages/        home, explore, login, register, post detail, profile, followers/following
    hooks/        useAuth, usePostList
    context/      AuthContext
```

## Notes

- Family-safe demo: no DMs, no stories, no live video, no notifications inbox, no hashtags, no OAuth, no ads or upgrades.
- Passwords are hashed with bcrypt; tokens expire after 7 days.
- Like and follow are backed by unique compound indexes, so repeats are safe.
- Counts (likes, comments) are denormalized on the post and kept correct on every write, including deletes.
