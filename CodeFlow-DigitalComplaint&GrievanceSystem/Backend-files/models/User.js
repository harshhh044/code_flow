const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },
    fullName: {
      type: String,
      trim: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
    },
    uniEmail: {
      type: String,
      lowercase: true,
    },
    personalEmail: {
      type: String,
      lowercase: true,
    },
    password: {
      type: String,
      required: true,
      minlength: 6,
    },
    role: {
      type: String,
      enum: ["student", "staff", "admin"],
      default: "student",
    },
    department: {
      type: String,
      default: "",
    },
    dept: {
      type: String,
      default: "",
    },
    rollNumber: {
      type: String,
      default: "",
    },
    rollNo: {
      type: String,
      default: "",
    },
    studentId: {
      type: String,
      default: "",
    },
    uid: {
      type: String,
      default: "",
    },
    status: {
      type: String,
      enum: ["active", "blocked", "restricted", "removed"],
      default: "active",
    },
    phone: {
      type: String,
      default: "",
    },
  },
  { timestamps: true }
);

// Auto-hash password before saving
userSchema.pre("save", async function (next) {
  if (!this.isModified("password")) return next();
  this.password = await bcrypt.hash(this.password, 12);
  next();
});

// Compare passwords
userSchema.methods.matchPassword = async function (enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};

module.exports = mongoose.model("User", userSchema);