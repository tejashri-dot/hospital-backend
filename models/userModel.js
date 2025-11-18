import mongoose from "mongoose";

const userSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
    },
    email: {
        type: String,
        required: true,
        unique: true,
    },
    password: {
        type: String,
        required: true,
    },
    image : {
        type: String,
        default: "https://res.cloudinary.com/dqj0v4x5g/image/upload/v1698230982/doctor_1_ebxq8h.png",
    },
   
    address: {
        type: Object,
       default: {
            city: "",
            state: "",
            country: "",
            pincode: "",
        },
    },
    gender: {
        type: String,
        default: "Not Selected",
    },
    dob: {
        type: String,
        default: "Not Selected",
    },
    phone: {
        type: String,
        default: "000-000-0000",
    },
}
);

const userModel = mongoose.models.user || mongoose.model("user", userSchema);
export default userModel;