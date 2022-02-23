const { AuthenticationError } = require("apollo-server-express");
const { User } = require("../models/User");
const { signToken } = require("../utils/auth");

const resolvers = {
  Query: {
    users: async () => {
      return User.find().select("-__v -password");
    },
    user: async (parent, { username }) => {
      return User.findOne({ username }).select("-__v -password");
    },
  },

  Mutation: {
    addUser: async (parent, args) => {
      const user = await User.create(args);
      const token = signToken(user);

      return { token, user };
    },

    login: async (parent, { email, password }) => {
      const user = await User.findOne({ email });

      if (!user) {
        throw new AuthenticationError("Incorrect credentials");
      }

      const correctPw = await user.isCorrectPassword(password);

      if (!correctPw) {
        throw new AuthenticationError("Incorrect credentials");
      }

      const token = signToken(user);
      return { token, user };
    },

    addBook: async (
      parent,
      { userId, authors, description, bookId, image, link, title }
    ) => {
      const book = { authors, description, bookId, image, link, title };
      console.log(book);

      return User.findOneAndUpdate(
        { _id: userId },
        {
          $addToSet: { savedBooks: book },
        },
        {
          new: true,
          runValidators: true,
        }
      );
    },

    removeUser: async (parent, { userId }) => {
      return User.findOneAndDelete({ _id: userId });
    },

    removeBook: async (parent, { userId, bookId }) => {
      return User.findOneAndUpdate(
        { _id: userId },
        { $pull: { savedBooks: { bookId: bookId } } },
        { new: true }
      );
    },
  },
};

module.exports = resolvers;
