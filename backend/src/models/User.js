const mongoose = require('mongoose');

const userSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true, minlength: 1, maxlength: 60 },
    username: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
      match: [/^[a-z0-9_]{3,20}$/, 'Usernames are 3-20 characters using letters, numbers, or underscores.'],
    },
    email: { type: String, required: true, unique: true, lowercase: true, trim: true },
    passwordHash: { type: String, required: true },
    bio: { type: String, default: '', maxlength: 200 },
    avatarUrl: { type: String, default: '', maxlength: 500 },
    role: { type: String, enum: ['user', 'admin'], default: 'user' },
  },
  { timestamps: true }
);

userSchema.methods.toPublic = function toPublic() {
  return {
    id: this._id,
    name: this.name,
    username: this.username,
    bio: this.bio,
    avatarUrl: this.avatarUrl,
    createdAt: this.createdAt,
  };
};

userSchema.methods.toPrivate = function toPrivate() {
  return {
    id: this._id,
    name: this.name,
    username: this.username,
    email: this.email,
    bio: this.bio,
    avatarUrl: this.avatarUrl,
    role: this.role,
    createdAt: this.createdAt,
  };
};

module.exports = mongoose.model('User', userSchema);
