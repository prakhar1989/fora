// Generated by CoffeeScript 1.6.2
(function() {
  var AppError, BaseModel, Message, moment, _ref,
    __bind = function(fn, me){ return function(){ return fn.apply(me, arguments); }; },
    __hasProp = {}.hasOwnProperty,
    __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };

  AppError = require('../common/apperror').AppError;

  moment = require('../common/moment');

  BaseModel = require('./basemodel').BaseModel;

  Message = (function(_super) {
    __extends(Message, _super);

    function Message() {
      this.format = __bind(this.format, this);      _ref = Message.__super__.constructor.apply(this, arguments);
      return _ref;
    }

    Message.describeModel = function() {
      return {
        type: Message,
        collection: 'messages',
        fields: {
          userid: 'string',
          type: {
            type: 'string',
            validate: function() {
              return ['message', 'global-notification', 'user-notification'].indexOf(this.type) !== -1;
            }
          },
          to: {
            useCustomValidationOnly: true,
            validate: function() {
              if (this.type === 'user-notification' || this.type === 'message') {
                return this.to.validate();
              }
            }
          },
          from: {
            useCustomValidationOnly: true,
            validate: function() {
              if (this.type === 'message') {
                return this.from.validate();
              }
            }
          },
          data: 'object',
          createdAt: {
            autoGenerated: true,
            event: 'created'
          },
          updatedAt: {
            autoGenerated: true,
            event: 'updated'
          }
        },
        logging: {
          isLogged: true,
          onInsert: 'NEW_MESSAGE'
        }
      };
    };

    Message.prototype.format = function(_format) {
      var error, user;

      try {
        switch (_format) {
          case 'timeline':
            switch (this.reason) {
              case 'new-forum':
                user = this.data.forum.createdBy;
                return {
                  subject: {
                    thumbnail: user.thumbnail,
                    name: user.name,
                    link: user.domain === 'tw' ? "/@" + user.username : "/" + user.domain + "/" + user.username
                  },
                  verb: "added a new forum",
                  object: {
                    thumbnail: this.data.forum.icon,
                    name: this.data.forum.name,
                    link: "/" + this.data.forum.stub
                  },
                  time: moment(this.timestamp).from(Date.now())
                };
              case 'published-post':
                user = this.data.post.createdBy;
                return {
                  subject: {
                    thumbnail: user.thumbnail,
                    name: user.name,
                    link: user.domain === 'tw' ? "/@" + user.username : "/" + user.domain + "/" + user.username
                  },
                  verb: "published",
                  object: {
                    name: this.data.post.title,
                    link: "/" + this.data.post.forum.stub + "/" + this.data.post._id
                  },
                  time: moment(this.timestamp).from(Date.now())
                };
            }
        }
      } catch (_error) {
        error = _error;
        return '';
      }
    };

    return Message;

  })(BaseModel);

  exports.Message = Message;

}).call(this);
