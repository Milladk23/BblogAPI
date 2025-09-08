import mongoose from 'mongoose';
import validator from 'validator';
import bcrypt from 'bcrypt';

const Schema = mongoose.Schema;

const userSchema = new Schema({
    firstName: {
        type: String,
        required: [true, 'User must have a firstname'],
        minLength: [3, 'Firstnameshoul be 3 charracters or more'],
    },
    lastName: {
        type: String,
        required: [true, 'User must have a lastname'],
        minLength: [3, 'Lastnameshoul be 3 charracters or more'],
    },
    email: {
        type: String,
        required: [true, 'User must have an email'],
        unique: true,
        validate: [validator.isEmail, 'Please Enter Email'],
        trim: true,
        lowercase: true,
    },
    role: {
    type: String,
    enum: ['user', 'admin'],
    default: 'user',
  },
  password: {
    required: [true, 'User must have a password'],
    type: String,
    minLength: [8, 'Lastnameshoul be 8 charracters or more'],
    maxLength: [20, 'Lastnameshoul be 20 charracters or less'],
    trim: true,
    select: false
  },
  passwordConfirm: {
    type: String,
    required: [true, 'You must fill the confirm password field'],
    minLength: [8, 'Lastnameshoul be 8 charracters or more'],
    maxLength: [20, 'Lastnameshoul be 20 charracters or less'],
    trim: true,
    select: false,
    validate: {
      validator: function(el) {
        el === this.password;
      },
      message: 'passwords are diffrent',
    }
  },
  photo: {
    type: String,
    default: 'default.jpeg',
  },
  createdAt: {
    type: Date,
    default: Date.now,
    select: false,
  },
  birthday: Date,
  changePasswordAt: Date
});

userSchema.pre('save', async function(next) {
  if(!this.isModified('password')) return next();

  this.password = await bcrypt.hash(this.password, 12);
  this.passwordConfirm = undefined;

  next();
});

userSchema.methods.correctPassword = async function(
  candidatePassword,
  userPassword
) {
  return bcrypt.compare(candidatePassword, userPassword);
}

userSchema.methods.changedPasswordAfter = function (JWTTimestamp) {
  if (this.changePasswordAt) {
    const changedTimestamp = parseInt(
      this.changePasswordAt.getTime() / 1000,
      10,
    );

    if (JWTTimestamp < changedTimestamp) return true;
  }

  // False means NOT changed
  return false;
};

const User = mongoose.model('User', userSchema);

export default User;