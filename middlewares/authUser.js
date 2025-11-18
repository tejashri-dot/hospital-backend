import jwt from "jsonwebtoken";

//user authentication middleware
const authUser = (req, res, next) => {
  try {
    const { token } = req.headers;

    console.log("authUser middleware triggered");

    if (!token) {
      return res.json({ success: false, message: "Unauthorized token" });
    }
    const token_decoded = jwt.verify(token, process.env.JWT_SECRET);

    console.log("Decoded token:", token_decoded);

    // Ensure req.body exists
    req.body = req.body || {};

    // Set userId from decoded token this id get in usercontroller
    req.body.userId = token_decoded.userId;

    next();
  } catch (error) {
    return res.json({ success: false, message: error.message });
  }
};

export default authUser;
