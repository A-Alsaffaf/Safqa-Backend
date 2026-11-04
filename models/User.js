const mongoose = require("mongoose");

const userSchema = new mongoose.Schema(
  {
    username: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      lowercase:true
    },
    hashedPassword: {
      type: String,
      required: true
    },
    email:{
      type: String, 
      required: true, 
      unique: true
    }, 
    role: {
      type: String,
      enum: ['User', 'Admin'],
      default: 'User'
    }

  },{ timestamps: true });

userSchema.set("toJSON", {
  transform: (document, returnedObject) => {
    delete returnedObject.hashedPassword;
  },
});

const User = mongoose.model("User", userSchema);

module.exports = User;
