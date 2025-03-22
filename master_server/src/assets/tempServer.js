//TODO: DELETE IT AFTER TESTING

import express from 'express';
import cors from 'cors';

const app = express();

app.use(cors({
    origin: "*",
    credentials: true,
}));
app.use(express.json());


app.post('/loginVolunteer', (req, res) => {
    const { email, biometric } = req.body;
    console.log(email, biometric);
    
    res.status(200).send('Voter Registered');
});
app.post('/loginEcmember', (req, res) => {
    console.log(req.body);
    res.status(200).send('Voter Registered');
});

app.listen(5000, () => {
    console.log('Server is running on port 5000');
});