// load in path module to set up the paths for static assets
const path = require('path')
const http = require('http')
const express = require('express')
const socketio = require('socket.io')
const Filter = require('bad-words')
const { generateMessage, generateLocationMessage } = require('./utils/messages')
const { addUser, removeUser, getUser, getUsersInRoom } = require('./utils/users')

// set up the express server + define port (create .env and pop in .gitignore)
const app = express()
const server = http.createServer(app)
// call socketio function and pass it the server constant
const io = socketio(server)

const port =  process.env.PORT || 3000

// define the static asset directory
const publicDirectoryPath = path.join(__dirname, '../public')
app.use(express.static(publicDirectoryPath))


// when connection occurs, run the function
io.on('connection', (socket) => {
    
    console.log('New websocket connection!')

    socket.on('join', ({ username, room }, callback) => {
        const { error, user} = addUser({ id: socket.id, username, room })
        
        if(error)  {
            return callback(error)
        }

        // socket.join subscribes a socket to a given room. Using user.room enables you to use clean/trimmed room name
        socket.join(user.room)

        //again user user.room and user.username to ensure we're using version of room/username that is being stored
        socket.emit('message', generateMessage('admin', "Welcome!"))
        socket.broadcast.to(user.room).emit('message', generateMessage(user.username, `${user.username} is now here`))
        
        // Send an update to the users in the room when someone joins
        io.to(user.room).emit('roomData', {
            room: user.room,
            users: getUsersInRoom(user.room)
        })
        // call callback to let client know they have been able to join successfully (called without any error)
        callback()
    })
    
    socket.on('sendMessage', (message, callback) => {
        const user = getUser(socket.id)
        const filter = new Filter()
        if(filter.isProfane(message)){
            return callback("Please do not use profanity")
        }

        io.to(user.room).emit('message', generateMessage(user.username, message))
        callback()
    })
    // send location to client
    socket.on('sendLocation', (coords, callback) => {
        const user = getUser(socket.id)
        io.to(user.room).emit('locationMessage', generateLocationMessage(user.username, `https://www.google.com/maps?=${coords.latitude},${coords.longitude}`))
        callback()
    })

    //reminder: user id is stored on socket.id
    socket.on('disconnect', () => {
        const user = removeUser(socket.id)

        if (user) {
            io.to(user.room).emit('message', generateMessage('admin', `${user.username} has left the room`))
            io.to(user.room).emit('roomData', {
                room: user.room,
                users: getUsersInRoom(user.room)
            })
        }
        

    })
})

// fire her up!
server.listen(port, () => {
    console.log(`Server is up on port ${port}`)
    })