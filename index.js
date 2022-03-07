const app = require('express')()
const server = require('http').createServer(app)

const PORT = process.env.PORT || 5000
const ORIGIN = 'http://localhost:3000'
const io = require('socket.io')(server, {
    cors: {
        origin: ORIGIN,
        methods: ['GET', 'POST'],
    }
}, { wsEngine: 'ws' })

const { 
    addUserForRandomGame, 
    addUserForFriendGame, 
    getOtherUserInRoom,
    removeUser,
    getUserCount, 
    getGamesInProgressCount 
}  = require('./util.js')

// socket code start
io.on('connection', (socket) => {

    io.emit('user-count', getUserCount())
    io.emit('game-count', getGamesInProgressCount())

    console.log('New connection', socket.id)

    const id = socket.id
    let user
    let currentGame

    socket.on('join', ({ gameId }, callback) => {
        if (gameId) 
            var { err, newUser, game } = addUserForFriendGame({ id, gameId })
        else 
            var { err, newUser, game } = addUserForRandomGame({ id })

        console.log('err hai kya', err)

        if (err && callback) {
            return callback(err)
        }

        user = newUser
        currentGame = game

        socket.join(game)

        // will be handled only for friend game
        socket.emit('game-id-for-friend', { gameId: socket.id })

        socket.emit('me', { id: socket.id, color: newUser.color })

        if (game && game.length === 2)
            io.to(game).emit('opponent-connected', {
                user1: currentGame[0], user2: currentGame[1]
            })

        io.emit('user-count', getUserCount())
        io.emit('game-count', getGamesInProgressCount())
    })

    socket.on('move', (move) => {
        //console.log('server pe move aaya', move)
        io.to(getOtherUserInRoom(id, currentGame)).emit('move', move)
    })

    socket.on('calluser', ({ userToCall, signalData, from }) => {
        io.to(userToCall).emit('calluser', {signal: signalData, from})
    })

    socket.on('answercall', (data) => {
        io.to(data.to).emit('callaccepted', data.signal)
    })

    socket.on('disconnected', () => {
        console.log('disconnected!! ', socket.id)
        if (currentGame && currentGame.length == 2)
            io.to(currentGame).emit('opponent-disconnected')
        removeUser(id)

        io.emit('user-count', getUserCount())
        io.emit('game-count', getGamesInProgressCount())
    })

    socket.on('disconnect', () => {
        console.log('disconnected!! ', socket.id)
        if (currentGame && currentGame.length == 2)
            io.to(currentGame).emit('opponent-disconnected')
        removeUser(id)

        io.emit('user-count', getUserCount())
        io.emit('game-count', getGamesInProgressCount())
    })

})
// socket code end

app.get('/', (req, res) => {
    res.send('Server is up and running')
})

server.listen(PORT, () => {
    console.log(`Server running at port ${PORT}`)
})