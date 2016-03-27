import mongoose from 'mongoose';
import { expect } from 'chai';
import MongoTangram from '../MongoTangram';
import { UserSchema } from '../../__tests__/schemas';
describe('MongoTangram', () => {
  const tangram = new MongoTangram([UserSchema], { mongoose });
  const UserModel = tangram.getModel('User');
  function addUser() {
    return tangram.exec('User', `
      mutation {
        addUser(INPUT: { name: "newUser", age: 22 }) {
          id
          name
        }
      }
    `);
  }
  it('should be as mongoose schema.', () => {
    const { ObjectId } = mongoose.Schema.Types;
    expect(tangram.getMongooseSchema('User')).to.eql({
      name: { type: String, required: true, maxlength: 20, minlength: 5 },
      age: { type: Number, required: true },
      friends: { type: [{ type: ObjectId, ref: 'User' }], required: false, default: [] },
    });
  });
  it('should create a mongoose model.', async() => {
    const doc = new UserModel({
      name: String(Date.now()),
      age: 22,
    });
    const res = await doc.save();
    const finded = await UserModel.findOne({ _id: res._id });
    expect(finded.name).to.eql(doc.name);
  });
  it('should mongoose model populate success.', async() => {
    const user1 = new UserModel({ name: 'user1', age: '22' });
    await user1.save();
    const user2 = new UserModel({ name: 'user2', age: '21', friends: [user1._id] });
    await user2.save();
    const finded = await UserModel.findOne({ _id: user2._id }).populate('friends');
    expect(finded.friends[0]._id).to.eql(user1._id);
  });
  it('should add one success by graphql.', async() => {
    const data = await addUser();
    expect(data.addUser.id).to.match(new RegExp(`^${tangram.getSchema('User').id}_.+`));
    expect(data.addUser.name).to.eql('newUser');
  });
  it('should query count success.', async() => {
    const getCount = `
      query {
        userCount(age: 22)
      }
    `;
    const preCount = await tangram.exec('User', getCount);
    await addUser();
    await addUser();
    const afterCount = await tangram.exec('User', getCount);
    expect(afterCount.userCount - preCount.userCount).to.eql(2);
  });
});
