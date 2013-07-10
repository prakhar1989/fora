// Generated by CoffeeScript 1.6.2
(function() {
  var AppError, BaseModel, utils,
    __bind = function(fn, me){ return function(){ return fn.apply(me, arguments); }; };

  utils = require('../common/utils');

  AppError = require('../common/apperror').AppError;

  BaseModel = (function() {
    function BaseModel(params) {
      this.destroy = __bind(this.destroy, this);
      this.validateField = __bind(this.validateField, this);
      this.validateFields = __bind(this.validateFields, this);
      this.validate = __bind(this.validate, this);
      this.save = __bind(this.save, this);
      var meta;

      utils.extend(this, params);
      meta = this.constructor.__getMeta__();
      if (this._id) {
        this._id = meta.type._database.ObjectId(this._id);
      }
    }

    BaseModel.get = function(params, context, cb) {
      var meta,
        _this = this;

      meta = this.__getMeta__();
      return this._database.findOne(meta.collection, params, function(err, result) {
        return cb(err, result ? _this.constructModel(result, meta) : void 0);
      });
    };

    BaseModel.getAll = function(params, context, cb) {
      var meta,
        _this = this;

      meta = this.__getMeta__();
      return this._database.find(meta.collection, params, function(err, cursor) {
        return cursor.toArray(function(err, items) {
          var item;

          return cb(err, (items != null ? items.length : void 0) ? (function() {
            var _i, _len, _results;

            _results = [];
            for (_i = 0, _len = items.length; _i < _len; _i++) {
              item = items[_i];
              _results.push(this.constructModel(item, meta));
            }
            return _results;
          }).call(_this) : []);
        });
      });
    };

    BaseModel.find = function(params, fnCursor, context, cb) {
      var meta,
        _this = this;

      meta = this.__getMeta__();
      return this._database.find(meta.collection, params, function(err, cursor) {
        fnCursor(cursor);
        return cursor.toArray(function(err, items) {
          var item;

          return cb(err, (items != null ? items.length : void 0) ? (function() {
            var _i, _len, _results;

            _results = [];
            for (_i = 0, _len = items.length; _i < _len; _i++) {
              item = items[_i];
              _results.push(this.constructModel(item, meta));
            }
            return _results;
          }).call(_this) : []);
        });
      });
    };

    BaseModel.getCursor = function(params, context, cb) {
      var meta;

      meta = this.__getMeta__();
      return this._database.find(meta.collection, params, cb);
    };

    BaseModel.getById = function(id, context, cb) {
      var meta,
        _this = this;

      meta = this.__getMeta__();
      return this._database.findOne(meta.collection, {
        _id: this._database.ObjectId(id)
      }, function(err, result) {
        return cb(err, result ? _this.constructModel(result, meta) : void 0);
      });
    };

    BaseModel.destroyAll = function(params, cb) {
      var meta,
        _this = this;

      meta = this.__getMeta__();
      if (meta.validateMultiRecordOperationParams(params)) {
        return this._database.remove(meta.collection, params, function(err) {
          return typeof cb === "function" ? cb(err) : void 0;
        });
      } else {
        return typeof cb === "function" ? cb(new AppError("Call to destroyAll() must pass safety checks on params.", "SAFETY_CHECK_FAILED_IN_DESTROYALL")) : void 0;
      }
    };

    BaseModel.mergeMeta = function(child, parent) {
      var fields, k, meta, v, _ref;

      fields = utils.clone(parent.fields);
      _ref = child.fields;
      for (k in _ref) {
        v = _ref[k];
        fields[k] = v;
      }
      meta = utils.clone(parent);
      for (k in child) {
        v = child[k];
        if (k !== 'fields') {
          child[k] = v;
        } else {
          child.fields = fields;
        }
      }
      return meta;
    };

    BaseModel.__getMeta__ = function(model) {
      var e, meta, _ref;

      if (model == null) {
        model = this;
      }
      try {
        meta = model._getMeta();
        if ((_ref = meta.validateMultiRecordOperationParams) == null) {
          meta.validateMultiRecordOperationParams = function(params) {
            return false;
          };
        }
        return meta;
      } catch (_error) {
        e = _error;
        return utils.dumpError(e);
      }
    };

    BaseModel.getLimit = function(limit, _default, max) {
      var result;

      result = _default;
      if (limit) {
        result = limit;
        if (result > max) {
          result = max;
        }
      }
      return result;
    };

    BaseModel.constructModel = function(obj, meta) {
      var arr, contentType, field, fieldDef, item, name, result, value, _i, _len, _ref;

      if (meta.initializer) {
        return meta.initializer(obj);
      } else {
        result = {};
        _ref = meta.fields;
        for (name in _ref) {
          field = _ref[name];
          value = obj[name];
          fieldDef = this.getFullFieldDefinition(field);
          if (this.isCustomClass(fieldDef.type)) {
            if (value) {
              result[name] = this.constructModel(value, this.__getMeta__(fieldDef.type));
            }
          } else {
            if (value) {
              if (fieldDef.type === 'array') {
                arr = [];
                contentType = this.getFullFieldDefinition(fieldDef.contents);
                if (this.isCustomClass(contentType)) {
                  for (_i = 0, _len = value.length; _i < _len; _i++) {
                    item = value[_i];
                    arr.push(this.constructModel(item, this.__getMeta__(contentType.type)));
                  }
                } else {
                  arr = value;
                }
                result[name] = arr;
              } else {
                result[name] = value;
              }
            }
          }
        }
        if (obj._id) {
          result._id = obj._id;
        }
        if (meta.typeConstructor) {
          return meta.typeConstructor(result);
        } else {
          return new meta.type(result);
        }
      }
    };

    BaseModel.isCustomClass = function(type) {
      return ['string', 'number', 'boolean', 'object', 'array', ''].indexOf(type) === -1;
    };

    BaseModel.getFullFieldDefinition = function(def) {
      var fieldDef;

      if (typeof def !== "object") {
        fieldDef = {
          type: def,
          required: true
        };
      } else {
        fieldDef = def;
      }
      if (fieldDef.autoGenerated && (fieldDef.event === 'created' || fieldDef.event === 'updated')) {
        fieldDef.type = 'number';
        fieldDef.required = true;
      }
      if (fieldDef.required == null) {
        fieldDef.required = true;
      }
      return fieldDef;
    };

    BaseModel.prototype.save = function(context, cb) {
      var def, fieldName, meta, _ref,
        _this = this;

      meta = this.constructor.__getMeta__();
      _ref = meta.fields;
      for (fieldName in _ref) {
        def = _ref[fieldName];
        if (def.autoGenerated) {
          switch (def.event) {
            case 'created':
              if (this._id == null) {
                this[fieldName] = Date.now();
              }
              break;
            case 'updated':
              this[fieldName] = Date.now();
          }
        }
      }
      return this.validate(function(err, errors) {
        var error, fnSave, _i, _len;

        if (!errors.length) {
          fnSave = function() {
            var event, _ref1;

            _this._updateTimestamp = Date.now();
            _this._shard = meta.generateShard != null ? meta.generateShard(_this) : "1";
            if (_this._id == null) {
              if ((_ref1 = meta.logging) != null ? _ref1.isLogged : void 0) {
                event = {};
                event.type = meta.logging.onInsert;
                event.data = _this;
                _this.constructor._database.insert('events', event, function() {});
              }
              return _this.constructor._database.insert(meta.collection, _this, function(err, r) {
                return typeof cb === "function" ? cb(err, r) : void 0;
              });
            } else {
              return _this.constructor._database.update(meta.collection, {
                _id: _this._id
              }, _this, function(err, r) {
                return typeof cb === "function" ? cb(err, _this) : void 0;
              });
            }
          };
          if (_this._id && meta.concurrency === 'optimistic') {
            return _this.constructor.getById(_this._id, context, function(err, newPost) {
              if (newPost._updateTimestamp === _this._updateTimestamp) {
                return fnSave();
              } else {
                return typeof cb === "function" ? cb(new AppError("Update timestamp mismatch. Was " + newPost._updateTimestamp + " in saved, " + _this._updateTimestamp + " in new.", 'OPTIMISTIC_CONCURRENCY_FAIL')) : void 0;
              }
            });
          } else {
            return fnSave();
          }
        } else {
          utils.log("Validation failed for object with id " + _this._id + " in collection " + meta.collection + ".");
          for (_i = 0, _len = errors.length; _i < _len; _i++) {
            error = errors[_i];
            utils.log(error);
          }
          utils.log("Error generated at " + (Date().toString('yyyy-MM-dd')) + ".");
          return typeof cb === "function" ? cb(new AppError("Model failed validation.")) : void 0;
        }
      });
    };

    BaseModel.prototype.validate = function(cb) {
      var meta,
        _this = this;

      meta = this.constructor.__getMeta__();
      if (!meta.useCustomValidationOnly) {
        return this.validateFields(meta.fields, function(err, errors) {
          if (meta.validate) {
            return meta.validate.call(_this, meta.fields, function(err, _errors) {
              return cb(err, errors.concat(_errors));
            });
          } else {
            return cb(err, errors);
          }
        });
      } else {
        if (meta.validate != null) {
          return meta.validate.call(this, meta.fields, function(err, errors) {
            return cb(err, errors);
          });
        } else {
          return cb(null, []);
        }
      }
    };

    BaseModel.prototype.validateFields = function(fields, cb) {
      var def, errors, fieldName;

      errors = [];
      for (fieldName in fields) {
        def = fields[fieldName];
        BaseModel.addError(errors, fieldName, this.validateField(this[fieldName], fieldName, def));
      }
      if (cb) {
        return cb(null, errors);
      } else {
        return errors;
      }
    };

    BaseModel.prototype.validateField = function(value, fieldName, def) {
      var errors, fieldDef, item, _i, _len;

      errors = [];
      if (!def.useCustomValidationOnly) {
        fieldDef = BaseModel.getFullFieldDefinition(def);
        if (fieldDef.required && (value == null)) {
          errors.push("" + (JSON.stringify(fieldName)) + " is " + (JSON.stringify(value)));
          errors.push("" + fieldName + " is required.");
        }
        if (value) {
          if (fieldDef.type === 'array') {
            for (_i = 0, _len = value.length; _i < _len; _i++) {
              item = value[_i];
              BaseModel.addError(errors, fieldName, this.validateField(item, "[" + fieldName + " item]", fieldDef.contents));
            }
          } else {
            if ((BaseModel.isCustomClass(fieldDef.type) && !(value instanceof fieldDef.type)) || (!BaseModel.isCustomClass(fieldDef.type) && typeof value !== fieldDef.type)) {
              errors.push("" + fieldName + " is " + (JSON.stringify(value)));
              errors.push("" + fieldName + " should be a " + fieldDef.type + ".");
            }
          }
        }
      }
      if (def.validate) {
        BaseModel.addError(errors, fieldName, def.validate.call(this));
      }
      return errors;
    };

    BaseModel.prototype.destroy = function(context, cb) {
      var meta,
        _this = this;

      meta = this.constructor.__getMeta__();
      return this.constructor._database.remove(meta.collection, {
        _id: this._id
      }, function(err) {
        return typeof cb === "function" ? cb(err, _this) : void 0;
      });
    };

    BaseModel.addError = function(list, fieldName, error) {
      var item, _i, _len;

      if (error === true) {
        return list;
      }
      if (error === false) {
        list.push("" + fieldName + " is invalid.");
        return list;
      }
      if (error instanceof Array) {
        if (error.length > 0) {
          for (_i = 0, _len = error.length; _i < _len; _i++) {
            item = error[_i];
            if (item instanceof Array) {
              BaseModel.addError(list, fieldName, item);
            } else {
              list.push(error);
            }
          }
        }
        return list;
      }
      if (error) {
        list.push(error);
        return list;
      }
    };

    return BaseModel;

  })();

  exports.BaseModel = BaseModel;

}).call(this);
