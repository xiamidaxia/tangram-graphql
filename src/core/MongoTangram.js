import Tangram from './Tangram';
import { replaceObj, mapValues, idFixed } from '../utils';
/**
 * @class MongoTangram
 */
export default class MongoTangram extends Tangram {
  constructor(schemas, { mongoose }) {
    super(...arguments);
    if (!mongoose) throw new Error('MongoTangram need mongoose.');
    this._mongoose = mongoose;
  }

  queryById(schema, { id }) {
    if (!id) throw new Error('MongoTangram.queryById missing id.');
    const model = this.getModel(schema);
    return model.findById(id).then(idFixed);
  }

  queryOne(schema, args = {}) {
    const model = this.getModel(schema);
    return model.findOne(args).then(idFixed);
  }

  queryList(schema, args) {
    const model = this.getModel(schema);
    return model.find(args).then(idFixed);
  }

  queryCount(schema, args) {
    const model = this.getModel(schema);
    return model.count(args);
  }

  addOne(schema, { INPUT }) {
    if (!INPUT) {
      throw new Error(`${schema}.add${schema} cant not be empty input.`);
    }
    schema.checkData(INPUT);
    const Model = this.getModel(schema);
    const model = new Model(INPUT);
    return model.save().then(() => {
      return idFixed(model);
    });
  }

  deleteOne() {
  }

  deleteList() {
  }

  updateOne() {
  }

  updateList() {
  }

  /**
   * @param {Schema|String} schema
   * @returns {Object}
   */
  getMongooseSchema(schema) {
    schema = this.getSchema(schema);
    const Schema = this._mongoose.Schema;
    const { ObjectId, Buffer } = Schema.Types;
    const { refs } = schema;
    const typeMap = { String, Int: Number, Float: Number, Boolean, Array, Buffer, ObjectId, Date };
    return mapValues(schema.struct, (item) => {
      const res = replaceObj(item, {
        max: 'maxlength',
        min: 'minlength',
        defaultValue: 'default',
        type: (type, { ref }) => {
          if (type === 'Array' && ref) {
            if (typeMap[ref]) {
              return [typeMap[ref]];
            }
            if (refs[ref]) {
              return [{ type: ObjectId, ref }];
            }
          }
          if (typeMap[type]) {
            return typeMap[type];
          }
          if (refs[type]) {
            return ObjectId;
          }
          throw new Error(`Schema ${schema} relies on ${type}.`);
        },
      });
      if (Array.isArray(res.type) && res.ref) {
        delete res.ref;
      }
      return res;
    });
  }

  /**
   * @param {Schema|String} schema
   * @returns {Mongoose.model}
   */
  getModel(schema) {
    const mongoose = this._mongoose;
    if (mongoose.models[schema]) {
      return mongoose.models[schema];
    }
    return mongoose.model(schema.toString(), this.getMongooseSchema(schema));
  }
}
