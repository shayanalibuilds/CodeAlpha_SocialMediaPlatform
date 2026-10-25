require('dotenv').config();

// Fail fast (issue #2): without a real signing secret the API must not boot —
// tokens signed with a public fallback could be forged for any user.
try {
  require('./utils/tokens').resolveSecret();
} catch (err) {
  console.error(`[fatal] ${err.message}`);
  process.exit(1);
}

const app = require('./app');
const { connectDB } = require('./config/db');

const PORT = process.env.PORT || 5001;
const MONGO_URI = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/northwind_park';

async function main() {
  try {
    await connectDB(MONGO_URI);
    console.log('Connected to MongoDB');
    app.listen(PORT, () => {
      console.log(`Northwind Park API listening on http://127.0.0.1:${PORT}`);
    });
  } catch (err) {
    console.error('Failed to start server:', err.message);
    process.exit(1);
  }
}

main();
