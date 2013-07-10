// Generated by CoffeeScript 1.6.2
(function() {
  var AppError, Controller, Posts, conf, models, utils, _ref,
    __bind = function(fn, me){ return function(){ return fn.apply(me, arguments); }; },
    __hasProp = {}.hasOwnProperty,
    __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };

  conf = require('../../../conf');

  models = new (require('../../../models')).Models(conf.db);

  utils = require('../../../common/utils');

  AppError = require('../../../common/apperror').AppError;

  Controller = require('../controller').Controller;

  Posts = (function(_super) {
    __extends(Posts, _super);

    function Posts() {
      this.adminUpdate = __bind(this.adminUpdate, this);      _ref = Posts.__super__.constructor.apply(this, arguments);
      return _ref;
    }

    Posts.prototype.adminUpdate = function(req, res, next) {
      var _this = this;

      return this.ensureSession([req, res, next], function() {
        if (_this.isAdmin(req.user, req.network)) {
          return models.Post.getById(req.params.id, {}, function(err, post) {
            var tag, _i, _len, _ref1;

            if (req.body.tags) {
              _ref1 = req.body.tags.split(',');
              for (_i = 0, _len = _ref1.length; _i < _len; _i++) {
                tag = _ref1[_i];
                if (post.tags.indexOf(tag) === -1) {
                  post.tags.push(tag);
                }
              }
              return post.save({}, function(err, post) {
                return res.send(post);
              });
            }
          });
        } else {
          return next(new AppError("Access denied.", 'ACCESS_DENIED'));
        }
      });
    };

    return Posts;

  })(Controller);

  exports.Posts = Posts;

}).call(this);