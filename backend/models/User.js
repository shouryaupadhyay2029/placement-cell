const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");

const UserSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
    },
    email: {
        type: String,
        required: true,
        unique: true,
        match: [/^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/, 'Please add a valid email']
    },
    password: {
        type: String,
        required: false, // Made optional for Google OAuth users
    },
    role: {
        type: String,
        enum: ["user", "admin", "student"],
        default: "user",
    },
    branch: { 
        type: String, 
        default: "" 
    },
    year: { 
        type: String, 
        default: "" 
    },
    googleId: {
        type: String,
        select: false, // Hide by default
    },
    picture: {
        type: String, // Dynamic storage for Google Profile Picture
    }
}, {
    timestamps: true,
});


UserSchema.pre("save", async function () {
    // Only hash if password exists and is modified
    if (!this.password || !this.isModified("password")) return;

    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
});

// Method to compare entered password with hashed password in DB
UserSchema.methods.matchPassword = async function (enteredPassword) {
    if (!this.password) return false;
    return await bcrypt.compare(enteredPassword, this.password);
};

module.exports = mongoose.model("User", UserSchema);