import express from 'express';
import bodyParser from 'body-parser';
import cookieParser from 'cookie-parser'
import path from 'path';

// import routes
import ecRouter from "./routes/ec.routes.js"
import candidateRouter from "./routes/candidate.routes.js"
import evmRouter from "./routes/evm.routes.js"
import voterRouter from "./routes/voter.routes.js"
import votingRouter from "./routes/voting.routes.js"

const app = express();
app.set('view engine', 'ejs');
app.set('views', path.join('/app/src', 'views'));

// use middlewares
app.use(cookieParser());
app.use(bodyParser.urlencoded({ extended: true })); // Needed to parse form data
app.use(bodyParser.json()); // Needed for JSON requests


// cors

// mount routes
app.get('/', (req, res) => {
  res.send('Hello World bye');
});

app.use("/api/ec", ecRouter);
app.use("/api/candidate", candidateRouter)
app.use("/api/voter", voterRouter);
app.use("/api/evm", evmRouter);
app.use("/api/vote-cast", votingRouter);

app.get('/home',(req,res)=>{
  res.render('home.ejs')
})

app.get('/register-staff', async (req, res) => {
  try {
      const response = await handleEcStaffRegistration(req, res);
      res.render('register-staff', { message: "Staff registered successfully!" });
  } catch (error) {
      res.render('register-staff', { message: "Error: " + error.message });
  }
});

app.get('/register-volunteer', async (req, res) => {
  try {
      const response = await handleEcStaffRegistration(req, res);
      res.render('registrater-volunteer', { message: "Staff registered successfully!" });
  } catch (error) {
      res.render('registrater-volunteer', { message: "Error: " + error.message });
  }
});

app.get('/register-candidate', async (req, res) => {
  try {
      const response = await handleEcStaffRegistration(req, res);
      res.render('registrater-candidate', { message: "Staff registered successfully!" });
  } catch (error) {
      res.render('registrater-candidate', { message: "Error: " + error.message });
  }
});


export default app;