koa = require 'koa'
route = require 'koa-route'
utils = require '../lib/utils'
conf = require '../conf'

process.chdir __dirname

host = process.argv[2]
port = process.argv[3]

if not host or not port
    utils.log "Usage: app.js host port"
    process.exit()

utils.log "Fora API started at #{new Date} on #{host}:#{port}"

app = koa()

#Request Parsing & Network
parser = require '../lib/web/requestparser'
ForaTypeUtils = require('../models/foratypeutils').ForaTypeUtils
app.use (next) ->*
    if @method is 'POST' or @method is 'PUT' or @method is 'PATCH'
        @parser =  new parser.RequestParser(@, new ForaTypeUtils)
        yield @parser.init()

    network = (n for n in conf.networks when n.domains.indexOf(@host) isnt -1)
    if network.length
        @network = network[0]
    
    yield next

#Routes
m_users = require './controllers/users'
m_forums = require './controllers/forums'
m_posts = require './controllers/posts'
m_images = require './controllers/images'

app.use route.get '/api/healthcheck', -> this.body { jacksparrow: "alive" }

app.use route.post '/api/users', m_users.create
app.use route.get '/api/users/:username', m_users.item

app.use route.post '/api/forums', m_forums.create
app.use route.post '/api/forums/:forum/members', m_forums.join
app.use route.post '/api/forums/:forum', m_posts.create
app.use route.put '/api/forums/:forum/posts/:id', m_posts.edit

app.use route.post '/api/image', m_images.upload

app.use route.put "/api/admin/posts/:id", m_posts.admin_update

#Start
app.listen port
