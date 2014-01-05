ForaDbModel = require('./foramodel').ForaDbModel
hasher = require('../lib/hasher').hasher
models = require('./')

class Credentials extends ForaDbModel
    
    @typeDefinition: {
        type: @,
        alias: 'Credentials',
        collection: 'credentials',
        fields: {
            userid: 'string',
            username: 'string',
            token: 'string',
            builtin: { required: false, validate: -> if @builtin.method is 'PBKDF2' and @builtin.username and @builtin.hash and @builtin.salt then true else false },
            twitter: { required: false, validate: -> if @twitter.id and @twitter.username and @twitter.accessToken and @twitter.accessTokenSecret then true else false },
            facebook: { required: false, validate: -> if @facebook.id and @facebook.username and @facebook.accessToken then true else false },
            createdAt: { autoGenerated: true, event: 'created' },
            updatedAt: { autoGenerated: true, event: 'updated' }
        },
        validate: (fields) ->
            if not @builtin and not @twitter and not @facebook
                ['At least one credential must me specified.']
    }    


    #Todo. Token Expiry.   
    @authenticateBuiltinUser: (username, password, context, db) ->*
        credentials = yield models.Credentials.get({ "builtin.username": username }, context, db)
        if credentials
            salt = new Buffer credentials.builtin.salt, 'hex'
            result = yield Q.nfcall hasher, {plaintext: password, salt}
            if credentials.hash is result.key.toString 'hex'
                { token: credentials.token }
            else
                { success: false, error: "Invalid username or password" }
        else
            { success: false, error: "Invalid username or password" }
        


    getUser: (context, db) =>*
            yield models.User.getById(@userid, context, db)


exports.Credentials = Credentials
