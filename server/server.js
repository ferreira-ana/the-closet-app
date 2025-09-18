const connectDB = require('./utils/db');
const dotenv = require('dotenv');
dotenv.config({ path: './config.env' });

process.on('uncaughtException', (err) => {
  console.log('Uncaught exception. Shuting down');
  console.log(err.name, err.message);
  process.exit(1);
});

const app = require('./app');

//console.log(app.get('env')); // = development    it is defined by express

//console.log(process.env); //set by nodejs
connectDB().catch((err) => {
  console.error('DB connection failed:', err);
  process.exit(1);
});

const port = process.env.PORT || 8000;
const server = app.listen(port, () => {
  console.log(`App running on port ${port}`);
});

process.on('unhandledRejection', (err) => {
  console.log('Unhandled rejection. Shutting down');
  console.log(err.name, err.message);
  server.close(() => {
    //this is an abrupt way of ending the program because this aborts all the requests that are running or pending this is why we wrapped it
    process.exit(1);
  });
});
