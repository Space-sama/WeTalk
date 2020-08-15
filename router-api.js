const apiRouter = require('express').Router()
const userController = require('./controllers/userController')
const postController = require('./controllers/postController')
const followController = require('./controllers/followController')
const cors = require('cors')



apiRouter.use(cors)


// ma route pour http://localhost:1001/api/login
apiRouter.post('/login', userController.apiLogin)

// ma route pour http://localhost:1001/api/create-post
apiRouter.post('/create-post', userController.apiMustBeLoggedIn, postController.apiCreatePost)


apiRouter.delete('/post/:id', userController.apiMustBeLoggedIn, postController.apiDelete)

//http://localhost:1001/api/postsByAuthor/peppo

apiRouter.get('/postByAuthor/:username', userController.apiGetPostsByUsername)



module.exports = apiRouter

