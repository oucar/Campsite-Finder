```js
// All the users are greater (?) than "". Such Mongo Injections are prevented so that
// the code below will not return all the users in the database.
db.users.find({username: {"$gt:" ""}})
```