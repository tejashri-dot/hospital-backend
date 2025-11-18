import validator from "validator";
import bcrypt from "bcrypt";
import { v2 as cloudinary } from "cloudinary";
import { json } from "express";
import doctorModel from "../models/doctorModel.js";
import dotenv from "dotenv";
import jwt from "jsonwebtoken";

//API for Adding a doctor
const addDoctor = async (req, res) => {
  try {
    const {
      name,
      email,
      password,
      speciality,
      degree,
      experience,
      about,
      fees,
      address,
    } = req.body;
    const imgeFile = req.file;

    //checking all data for all doctors
    if (
      !name ||
      !email ||
      !password ||
      !speciality ||
      !degree ||
      !experience ||
      !about ||
      !fees ||
      !address
    ) {
      return res
        .status(400)
        .json({ success: false, message: "Please fill all the fields" });
    }

    //validating email
    if (!validator.isEmail(email)) {
      return res
        .status(400)
        .json({ success: false, message: "Please enter a valid email" });
    }

    //validating password
    if (password.length < 8) {
      return res.status(400).json({
        success: false,
        message: "Password must be at least 6 characters",
      });
    }

    // hashing doctor password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // upload image to cloudinary
    const imageUpload = await cloudinary.uploader.upload(imgeFile.path, {
      resource_type: "image",
    });
    const imageUrl = imageUpload.secure_url;

    //creating doctor
    const doctorData = {
      name,
      email,
      password: hashedPassword,
      speciality,
      degree,
      experience,
      about,
      fees,
      address: JSON.parse(address),
      image: imageUrl,
      date: Date.now(),
    };

    //saving doctor to database
    const newDoctor = new doctorModel(doctorData);

    console.log("cheking error : " + newDoctor);

    await newDoctor.save();

    res
      .status(201)
      .json({ success: true, message: "Doctor added successfully" });
  } catch (error) {
    console.log(error);
    res.status(500).json({ success: false, message: error.message });
  }
};

//API for Admin Login
const adminLogin = async (req, res) => {
  try {
    const { email, password } = req.body;
    //checking all data for all doctors
    if (
      email === process.env.ADMIN_EMAIL &&
      password === process.env.ADMIN_PASSWORD
    ) {
      const token = jwt.sign(email + password, process.env.JWT_SECRET);
      res.json({ success: true, message: "Login Success", token });
    } else {
      res.status(400).json({ success: false, message: "Invalid Credentials" });
    }
  } catch (error) {
    console.log(error);
    res.json({ success: false, message: error.message });
  }
};

//API to get all doctors list for admin panel
const getAllDoctors = async (req, res) => {
  try {
    const doctors = await doctorModel.find().select("-password");

    res.json({
      success: true,
      message: "Doctors fetched successfully",
      doctors,
    });
  } catch (error) {
    console.log(error);
    res.json({ success: false, message: error.message });
  }
};

export { addDoctor, adminLogin, getAllDoctors };
