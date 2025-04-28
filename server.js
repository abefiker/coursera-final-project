import express from 'express'
import jwt from 'jsonwebtoken'
import session from 'express-session'
import { route } from './routes/books'
const app = new express()
let users = []
const doesExist = (username) => {
    let user = users.filter(u => u.username === username)
    user.length > 0 ? true : false
}
const authenticateUser = (username, password) => {
    let user = users.filter(u => {
        u.username === username && u.password === password
    })
    user.length > 0 ? true : false
}
app.use(session({ secret: "fingerpint" }, resave = true, saveUninitialized = true));
app.use(express.json())
app.use('/books', function auth(req, res, next) {
    if (req.session.authorization) {
        let token = req.session.authorization['accessToken']
        jwt.verify(token, 'access', (err, user) => {
            if (!err) {
                req.user = user
                next()
            } else {
                return res.status(403).json({ message: 'user not authenticated' })
            }
        })
    } else {
        return res.status(403).json({ message: 'user not logged in' })
    }
})
app.post('/login', (req, res) => {
    const { username, password } = req.body
    if (!username || !password) {
        return res.status(404).json({
            message: 'Error loggin'
        })
    }
    if (authenticateUser(username, password)) {
        const accessToken = jwt.sign({ data: password }, 'access', { expiresIn: 60 * 60 })
        req.session.authorization = {
            accessToken, username
        }
        return res.status(200).send('user logged in successfully')
    } else {
        return res.status(401)
    }
})
app.port('/register', (req, res) => {
    const { username, password } = req.body
    if (!doesExist(username)) {
        users.push({ "username": username, "password": password })
        return res.status(201).json({
            message: 'user successfully registed'
        })
    } else {
        return res.status(409).json({ message: 'user already exist' })
    }
})
app.use('/books', route)
const port = 3636
app.listen(port, () => {
    console.log('express server on port : ' + port)
})