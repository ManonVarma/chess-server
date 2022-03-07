let games = []
/*
games = [
    [  // game (internal array) always has size = 2
        {
            id: user1.id,
            color: 'white',
            for: 'random/friend'
        },
        {
            id: user2.id,
            color: 'black',
            for: 'random/friend'
        } 
    ]    
]

*/


//gameId is friend's id
const addUserForRandomGame = ({ id }) => {
    let err

    const newUser = { 
        id: id, 
        color: null,
        for: 'random'
    }
    
    let allPaired = true
    let unPairedGameIndex
    let game = []
    for (let i=0; i<games.length; i++) {
        if ((games[i][0] && games[i][0].id === id) || (games[i][1] && games[i][1].id === id)) {
            err = 'already joined'
            return { err }
        }

        if (games[i].length === 1 && (games[i][0] && games[i][0].for === 'random')) {
            allPaired = false
            unPairedGameIndex = i
        }
    }

    if (games.length === 0 || allPaired) {  // initiate a new game, for the new user
        // the first user, to join the game, is assigned the white color
        newUser.color = 'white'
        game.push(newUser)
        games.push(game)
    } else {  // put the new user in the existing game, where the first user is waiting
        // the second user, to join the game, is assigned the black color
        newUser.color = 'black'
        games[unPairedGameIndex].push(newUser)
        game = games[unPairedGameIndex]
    }

    console.log('games = ', games)

    return { newUser, game }
}


const addUserForFriendGame = ({ id, gameId }) => {
    let err
    let game = []

    const newUser = { 
        id: id, 
        color: null,
        for: 'friend'
    }

    if (gameId === 'first') {
        newUser.color = 'white'
        game.push(newUser)
        games.push(game)
    } else {
        let gameIdFound = false
        
        for (let i=0; i<games.length; i++) {
            if (games[i][0] && games[i][0].id === gameId && games[i].length < 2) {
                newUser.color = 'black'
                games[i].push(newUser)
                game = games[i]

                gameIdFound = true
            }
        }

        if (gameIdFound === false) {
            err = 'Invalid Game ID'
            return { err }
        }
    }

    console.log('games => ', games)

    return { newUser, game }
}

const getOtherUserInRoom = (id, room) => {
    let otherUserId = null

    if (room[0].id === id && room[1])
        otherUserId = room[1].id
    else if (room[1] && room[1].id === id)
        otherUserId = room[0].id
    
    return otherUserId
}

const removeUser = (id) => {
    for (let i=0; i<games.length; i++) {
        if (games[i][0] && games[i][0].id === id)
            games.splice(i, 1)
        else if (games[i][1] && games[i][1].id === id)
            games.splice(i, 1)
    }

    console.log('games : ', games)
}

const getUserCount = () => {
    let userCount = 0

    for (let i=0; i<games.length; i++)
        userCount += games[i].length

    return userCount
}


const getGamesInProgressCount = () => {
    let gamesInProgress = 0

    games.forEach(game => {
        if (game.length === 2)
            gamesInProgress++
    })

    return gamesInProgress
}


module.exports = { addUserForRandomGame, addUserForFriendGame, getOtherUserInRoom, removeUser, getUserCount, getGamesInProgressCount }