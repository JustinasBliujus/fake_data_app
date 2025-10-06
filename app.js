import express from 'express'
import dotenv from 'dotenv'
import router from './routes/router.js';
import session from 'express-session';

dotenv.config();

var app = express();
app.use(express.static('public'));
app.set('views', 'views');
app.set('view engine', 'ejs');

app.use(session({
    secret: process.env.SESSION_SECRET || 'key', 
    resave: false,
    saveUninitialized: true,
    cookie: { maxAge: 24 * 60 * 60 * 1000 } 
}));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use('/', router); 

const PORT = process.env.PORT;
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});