require('dotenv').config();
require('express-async-errors');
const express = require('express');
const authenticateUser = require('./middleware/authentication');
const app = express();
// more security package
const helmet = require('helmet');
const cors = require('cors');
const xss = require('xss-clean');
const rateLamter = require('express-rate-limit');

//connect db
const connectDB = require('./db/connect');
app.get(('/'),(req,res)=>{
  res.send('jobs API')
})
//routers
const authRouter = require('./routes/auth');
const jobsRouter = require('./routes/jobs');

// error handler
const notFoundMiddleware = require('./middleware/not-found');
const errorHandlerMiddleware = require('./middleware/error-handler');

app.use(express.json());
// extra packages

// routes
app.set('trust proxy', 1); 
app.use(
  rateLamter({
    windowMs: 15 * 60 * 100,
    max: 100,
  })
);
app.use(helmet());
app.use(cors());
app.use(xss());

app.use('/api/v1/auth', authRouter);
app.use('/api/v1/jobs', authenticateUser, jobsRouter);

app.use(notFoundMiddleware);
app.use(errorHandlerMiddleware);

const port = process.env.PORT || 3000;

const start = async () => {
  try {
    await connectDB(process.env.MONGO_URI);
    app.listen(port, () =>
      console.log(`Server is listening on port ${port}...`)
    );
  } catch (error) {
    console.log(error);
  }
};

start();
