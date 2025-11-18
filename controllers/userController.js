import validator from "validator";
import bcrypt from "bcrypt";
import userModel from "../models/userModel.js";
import jwt from "jsonwebtoken";
import { v2 as cloudinary } from "cloudinary";
import doctorModel from "../models/doctorModel.js";
import AppointmentModel from "../models/appointmentModel.js";
//API to Register Email
const resgisterUser = async (req, res) => {
  try {
    const { name, email, password } = req.body;

    if (!name || !email || !password) {
      return res.json({
        success: false,
        message: "Please enter all the fields",
      });
    }

    //check email validation
    if (!validator.isEmail(email)) {
      return res.json({
        success: false,
        message: "Please enter a valid email",
      });
    }

    //check password length
    if (password.length < 8) {
      return res.json({
        success: false,
        message: "Password must be at least 8 characters long",
      });
    }

    // hashing user password
    // salt is use for rondom genarate the password
    const salt = await bcrypt.genSalt(10);
    // hash the password with the salt
    const hashedPassword = await bcrypt.hash(password, salt);

    // Here you would typically save the user to the database
    const userData = {
      name,
      email,
      password: hashedPassword,
    };

    // take above parameter from userModel and save in database
    const newUser = await userModel(userData);
    const user = await newUser.save();

    // Generate JWT token using Id
    const token = jwt.sign({ userId: user._id }, process.env.JWT_SECRET);
    res.json({ success: true, message: "User registered successfully", token });
  } catch (error) {
    console.log(error);
    res.json({
      success: false,
      message: error.message,
    });
  }
};

//user login function
const userLogin = async (req, res) => {
  try {
    const { email, password } = req.body;
    const userlogin = await userModel.findOne({ email });

    if (!userlogin) {
      return res.json({
        success: false,
        message: "user does not exist",
      });
    }

    //check email validation
    if (!validator.isEmail(email)) {
      return res.json({
        success: false,
        message: "Please enter a valid email",
      });
    }

    //find user by email
    const user = await userModel.findOne({ email });

    if (!user) {
      return res.json({
        success: false,
        message: "User not found",
      });
    }

    //compare password
    const isMatch = await bcrypt.compare(password, user.password);
    if (isMatch) {
      // Generate JWT token using Id
      const token = jwt.sign({ userId: user._id }, process.env.JWT_SECRET);
      res.json({
        success: true,
        message: "User logged in successfully",
        token,
      });
    } else {
      return res.json({
        success: false,
        message: "Invalid password",
      });
    }
  } catch (error) {
    console.log(error);
    res.json({
      success: false,
      message: error.message,
    });
  }
};

//API to get user profile data
const getProfile = async (req, res) => {
  try {
    const { userId } = req.body;
    const userData = await userModel.findById(userId).select("-password");

    res.json({ success: true, userData });
  } catch (error) {
    console.log(error);
    res.json({
      success: false,
      message: error.message,
    });
  }
};

//API to update user Profile
const UpdateProfile = async (req, res) => {
  try {
    const { userId, name, phone, address, dob, gender } = req.body;
    const imageFile = req.file;

    

    if (!name && !phone && !dob && !gender) {
      return res.json({ success: false, message: "Data Missing" });
    }

    await userModel.findByIdAndUpdate(userId, {
      name,
      phone,
      address: JSON.parse(address),
      dob,
      gender,
    });

    if (imageFile) {
      const imageUpload = await cloudinary.uploader.upload(imageFile.path, {
        resource_type: "image",
      });
      const imageUrl = imageUpload.secure_url;

      await userModel.findByIdAndUpdate(userId, { image: imageUrl });
    }

    res.json({ success: true, message: "profile Updated Succesfully" });
  } catch (error) {}
};

//Api for book appointment
const bookAppointment = async (req, res) => {
  console.log("Incoming body:", req.body);

  try {
    const { userId, docId, slotDate, slotTime } = req.body;

    const docData = await doctorModel.findById(docId).select("-password");
    if (!docData) {
      return res.json({
        success: false,
        message: "Doctor not available",
      });
    }

    // get the current slot_booked from doctor
    let slot_booked = docData.slot_booked || {};

    //  Check if the slot is already booked
    if (slot_booked[slotDate]) {
      if (slot_booked[slotDate].includes(slotTime)) {
        return res.json({
          success: false,
          message: "Slot already booked",
        });
      } else {
        slot_booked[slotDate].push(slotTime);
      }
    } else {
      slot_booked[slotDate] = [slotTime];
    }

    // Now get user data
    const userData = await userModel.findById(userId).select("-password");

    delete docData.slot_booked; // Remove slot_booked from doctor data

    const appointmentData = {
      userId,
      docId,
      slotDate,
      slotTime,
      userData,
      docData,
      amount: docData.fees,
      Date: Date.now(),
    };

    const newAppointment = new AppointmentModel(appointmentData);
    await newAppointment.save();

    // Update doctor's slot_booked
    await doctorModel.findByIdAndUpdate(docId, {
      slot_booked: slot_booked,
    });

    res.json({
      success: true,
      message: "Appointment booked successfully",
    });
  } catch (error) {
    console.log(error);
    res.json({
      success: false,
      message: error.message,
    });
  }
};

//Api to get user appointments for frontend my-appointments page
const listAppointments = async (req, res) => {
  try {
    const { userId } = req.body;

    const appointments = await AppointmentModel.find({ userId })
      .populate("docId", "-password")
      .sort({ Date: -1 });

    res.json({
      success: true,
      appointments,
    });
  } catch (error) {
    console.log(error);
    res.json({
      success: false,
      message: error.message,
    });
  }
};

//API for Cancel Appointment
const cancelAppointment = async (req, res) => {
  try {
    const { appointmentID, userId } = req.body;

    console.log("Appointment ID:", appointmentID);

    // Find the appointment
    const appointmentData = await AppointmentModel.findById(appointmentID);

    console.log("Appointment Data:", appointmentData);

    if (!appointmentData) {
      return res.json({
        success: false,
        message: "Appointment not found",
      });
    }

    // Verify the appointment belongs to the user
    if (appointmentData.userId.toString() !== userId) {
      return res.json({
        success: false,
        message: "You are not authorized to cancel this appointment",
      });
    }

    // Mark appointment as cancelled
    const con = await AppointmentModel.findByIdAndUpdate(
      appointmentID,
      { cancelled: true },
      { new: true } // ← returns updated document
    );
    console.log("Cancelled Appointment (updated):", con);

    // Releasing Doctor slot
    const { docId, slotDate, slotTime } = appointmentData;

    const doctorData = await doctorModel.findById(docId);

    if (
      doctorData &&
      doctorData.slots_booked &&
      doctorData.slots_booked[slotDate]
    ) {
      doctorData.slots_booked[slotDate] = doctorData.slots_booked[
        slotDate
      ].filter((e) => e !== slotTime);

      await doctorModel.findByIdAndUpdate(docId, {
        slots_booked: doctorData.slots_booked,
      });
    }

   
    return res.json({
      success: true,
      message: "Appointment cancelled successfully",
    });
  } catch (error) {
    console.log(error);
    return res.json({
      success: false,
      message: error.message,
    });
  }
};

export {
  resgisterUser,
  userLogin,
  getProfile,
  UpdateProfile,
  bookAppointment,
  listAppointments,
  cancelAppointment,
};
