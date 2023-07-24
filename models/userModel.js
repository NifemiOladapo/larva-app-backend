import mongoose from "mongoose";

const userSchema = mongoose.Schema({
  username: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  profilePicture: {
    type: String,
    default:
      "https://pluspng.com/img-png/user-png-icon-download-icons-logos-emojis-users-2240.png",
  },
  friends: [{ type: mongoose.SchemaTypes.ObjectId, ref: "user" }],
  selfNote: { type: String },
  isOnline: { type: Boolean, default: false },
  createdOn: { type: Date, default: Date.now() },
});

const User = mongoose.model("user", userSchema);

export default User;
