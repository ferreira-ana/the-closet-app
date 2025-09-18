const mongoose = require('mongoose');
const connectDB = async () => {
  const DB = process.env.DATABASE.replace(
    '<PASSWORD>',
    process.env.DATABASE_PASSWORD,
  );
  mongoose.set('strictQuery', false);
  await mongoose.connect(DB);
  console.log('DB connection successful');
};
module.exports = connectDB;
