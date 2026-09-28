const USERNAME_RE = /^[a-z0-9_]{3,20}$/;
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const URL_RE = /^https?:\/\/\S+$/i;

function validateRegister(body) {
  const name = typeof body.name === 'string' ? body.name.trim() : '';
  const username = typeof body.username === 'string' ? body.username.trim().toLowerCase() : '';
  const email = typeof body.email === 'string' ? body.email.trim().toLowerCase() : '';
  const password = typeof body.password === 'string' ? body.password : '';

  const errors = [];
  if (name.length < 1 || name.length > 60) errors.push('Please enter a name between 1 and 60 characters.');
  if (!USERNAME_RE.test(username)) errors.push('Usernames are 3-20 characters using letters, numbers, or underscores.');
  if (!EMAIL_RE.test(email)) errors.push('Please enter a valid email address.');
  if (password.length < 8) errors.push('Passwords need at least 8 characters.');

  return { errors, values: { name, username, email, password } };
}

function validateProfileUpdate(body) {
  const errors = [];
  const values = {};

  if (body.name !== undefined) {
    const name = typeof body.name === 'string' ? body.name.trim() : '';
    if (name.length < 1 || name.length > 60) errors.push('Please enter a name between 1 and 60 characters.');
    else values.name = name;
  }

  if (body.bio !== undefined) {
    const bio = typeof body.bio === 'string' ? body.bio.trim() : '';
    if (bio.length > 200) errors.push('Bios are limited to 200 characters.');
    else values.bio = bio;
  }

  if (body.avatarUrl !== undefined) {
    const avatarUrl = typeof body.avatarUrl === 'string' ? body.avatarUrl.trim() : '';
    if (avatarUrl && (!URL_RE.test(avatarUrl) || avatarUrl.length > 500)) {
      errors.push('Avatar needs a valid http(s) image URL.');
    } else {
      values.avatarUrl = avatarUrl;
    }
  }

  return { errors, values };
}

function validatePost(body) {
  const text = typeof body.body === 'string' ? body.body.trim() : '';
  const imageUrl = typeof body.imageUrl === 'string' ? body.imageUrl.trim() : '';

  const errors = [];
  if (text.length < 1) errors.push('Write something first.');
  if (text.length > 280) errors.push('Updates are limited to 280 characters.');
  if (imageUrl && (!URL_RE.test(imageUrl) || imageUrl.length > 500)) {
    errors.push('Image needs a valid http(s) URL.');
  }

  return { errors, values: { body: text, imageUrl } };
}

module.exports = { USERNAME_RE, EMAIL_RE, URL_RE, validateRegister, validateProfileUpdate, validatePost };
