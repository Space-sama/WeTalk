const usersCollection = require('../db').db().collection("users")
const followsCollection = require('../db').db().collection("follows")
const User = require('./User')
const ObjectID = require('mongodb').ObjectID


let Follow = function(followedUsername, authorId) {
     this.followedUsername = followedUsername
     this.authorId = authorId
     this.errors = []
}

Follow.prototype.cleanUp = function() {
    if (typeof(this.followedUsername) != "string") {
        this.followedUsername = ""
    }
}

Follow.prototype.validate = async function (action) {
    //followedUsername must exist in database
    let followedAccount = await usersCollection.findOne({username: this.followedUsername})
    if (followedAccount) {
        this.followedId = followedAccount._id

    } else {
        this.errors.push("you cannot follow user that does not exist !")
    }

    let doesFollowedAlreadyExist = await followsCollection.findOne({followedId: this.followedId, authorId: new ObjectID(this.authorId)})

    if (action == "create") {
         // should not be able follow yourself
         if (this.followedId.equals(this.authorId)){ this.errors.push("you cannot follow yourself !")}

        if (doesFollowedAlreadyExist) {
            this.errors.push("you are already following this user.")
        }}

        if (action == "delete") {
            if (!doesFollowedAlreadyExist) {
                this.errors.push("you cannot stop following someone you do not already follow !")
            }

           
    
}
}


Follow.prototype.create = function() {
    
    return new Promise(async (resolve, reject) =>{
        this.cleanUp()
       await this.validate("create")

       if (!this.errors.length) {
        await followsCollection.insertOne({followedId: this.followedId, authorId: new ObjectID(this.authorId)})
        resolve();
       } else {
        reject(this.errors)
       }
    })
}

Follow.prototype.delete = function() {
    
    return new Promise(async (resolve, reject) =>{
        this.cleanUp()
       await this.validate("delete")

       if (!this.errors.length) {
        await followsCollection.deleteOne({followedId: this.followedId, authorId: new ObjectID(this.authorId)})
        resolve();
       } else {
        reject(this.errors)
       }
    })
}

Follow.isVisitorFollowing = async function(followedId, visitId) {
    let followDoc = await followsCollection.findOne({followedId: followedId, authorId: new ObjectID(visitId)})
    if(followDoc) {
        return true
    } else {
        return false
    }
}

Follow.getFollowersByID = function(id) {
    try {
        return new Promise(async (resolve, reject) =>{
            let followers = await followsCollection.aggregate([
                {$match: {followedId: id}}, 
                {$lookup: {from: "users", localField: "authorId", foreignField: "_id", as: "userDoc"}}, 
                {$project: {
                    username: {$arrayElemAt: ["$userDoc.username", 0]},
                    email: {$arrayElemAt: ["$userDoc.email", 0]}
                }}
            ]).toArray()
            followers = followers.map(function(follower) {
                // create a user
                let user = new User(follower, true)
                return {username: follower.username, avatar: user.avatar}
            })
            resolve(followers)
        })

    } catch {
        reject()
    }
}

Follow.getFollowingByID = function(id) {
    try {
        return new Promise(async (resolve, reject) =>{
            let following = await followsCollection.aggregate([
                {$match: {authorId: id}}, 
                {$lookup: {from: "users", localField: "followedId", foreignField: "_id", as: "userDoc"}}, 
                {$project: {
                    username: {$arrayElemAt: ["$userDoc.username", 0]},
                    email: {$arrayElemAt: ["$userDoc.email", 0]}
                }}
            ]).toArray()
            following = following.map(function(following) {
                // create a user
                let user = new User(following, true)
                return {username: following.username, avatar: user.avatar}
            })
            resolve(following)
        })

    } catch {
        reject()
    }
}

Follow.countFollowersByID = function(id) {
    return new Promise(async (resolve, reject) =>{
      let FollowerCount = await followsCollection.countDocuments({followedId: id})
      resolve(FollowerCount)
    })
  }


  Follow.countFollowingByID = function(id) {
    return new Promise(async (resolve, reject) =>{
      let FollowingCount = await followsCollection.countDocuments({authorId: id})
      resolve(FollowingCount)
    })
  }

module.exports = Follow