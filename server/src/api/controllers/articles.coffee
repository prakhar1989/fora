conf = require '../../conf'
db = new (require '../../common/data/database').Database(conf.db)
models = require '../../models'
utils = require '../../common/utils'
Controller = require('./controller').Controller
Q = require('../../common/q')

class Articles extends Controller
            
    create: (req, res, next, forum) =>
        @ensureSession arguments, =>    
            article = new models.Article
            article.createdBy = req.user
            article.forum = forum.summarize()
            article.rating = 0
            
            if req.body.publish is 'true'        
                article.publishedAt = Date.now()
                article.state = 'published'
            else
                article.state = 'draft'
            
            @parseBody article, req.body
            
            (Q.async =>
                try                
                    article = yield forum.addPost article
                    res.send article
                            
                    if req.body.publish is 'true'
                        message = new models.Message {
                            userid: '0',
                            type: "global-notification",
                            reason: 'published-article',
                            related: [ { type: 'user', id: req.user.id }, { type: 'forum', id: forum.stub } ],
                            data: { article }
                        }
                        message.save({ user: req.user }, db)
                catch e
                    next e
            )()
            
                                

    edit: (req, res, next, forum) =>
        @ensureSession arguments, =>        
            (Q.async =>
                try
                    article = yield models.Article.getById(req.params.post, { user: req.user }, db)
                    if article
                        if article.createdBy.id is req.user.id or @isAdmin(req.user)
                            alreadyPublished = article.state is 'published'

                            if not alreadyPublished and req.body.publish is 'true'
                                article.publishedAt ?= Date.now()
                                article.state = 'published'

                            @parseBody article, req.body
                    
                            article = yield article.save()
                            if article.createdBy.id is req.user.id and not alreadyPublished and req.body.publish is 'true'
                                message = new models.Message {
                                    userid: '0',
                                    type: "global-notification",
                                    reason: 'published-article',
                                    related: [ { type: 'user', id: req.user.id }, { type: 'forum', id: forum.stub } ],
                                    data: { article }
                                }
                                message.save({ user: req.user }, db)
                        else
                            res.send 'Access denied.'
                    else
                        res.send 'Invalid article.'
                catch e
                    next e)()    
                    


    parseBody: (article, body) =>
        article.format = 'markdown'
        
        article.title = body.title
        article.stub = body.title.toLowerCase().trim().replace(/\s+/g,'-').replace(/[^a-z0-9|-]/g, '').replace(/^\d*/,'')
        article.content = body.content

        if body.cover
            article.cover = body.cover
            if body.coverTitle
                article.coverTitle = body.coverTitle
            article.smallCover = body.smallCover
    
exports.Articles = Articles