import mongoose from "mongoose";
import bcrypt from "bcryptjs";

//step 1 : create schema first
const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, "Name is required"],
    trim: true,
    validate: {
      validator: function (v) {
        return v.trim().length > 0;
      },
      message: "Name cannot be empty",
    },
  },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  barCouncilId: {
    type: String,
    unique: true,
    sparse: true,
  },
  role: {
    type: String,
    enum: ["lawyer", "admin"],
    required: true,
  },
});

//step 2 : add pre-save hook After schema
userSchema.pre("save", async function (next) {
  // only hash if password is modified
  if (!this.isModified("password")) return;

  this.password = await bcrypt.hash(this.password, 10);
});

export default mongoose.model("User", userSchema);
