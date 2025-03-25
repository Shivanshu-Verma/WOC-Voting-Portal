//TODO: DELETE IT AFTER TESTING

import express from 'express';
import cors from 'cors';

const app = express();

app.use(cors({
    origin: ["http://localhost:5173", "http://172.31.100.155:5173"],
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


app.post('/set-cookie', (req, res) => {
    console.log("setting cookie")
    res.cookie("auth_token", "testing", {
        httpOnly: true,
        maxAge: 12 * 60 * 60 * 1000,
        secure: false,
        sameSite: 'lax',
    });
    res.send('Test cookie set!');
});

app.listen(5000, () => {
    console.log('Server is running on port 5000');
});