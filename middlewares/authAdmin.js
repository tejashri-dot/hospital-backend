import jwt from "jsonwebtoken";

const authAdmin = (req, res, next) => {
  try {
    const { atoken } = req.headers;
    if (!atoken) {
      return res.json({ success: false, message: "Unauthorized" });
    }
    const token_decoded = jwt.verify(atoken, process.env.JWT_SECRET);

    if (
      token_decoded !==
      process.env.ADMIN_EMAIL + process.env.ADMIN_PASSWORD
    ) {
      return res.json({ success: false, message: "Not Authrised Login Again" });
    }
    next();
  } catch (error) {
    return res.json({ success: false, message: "Unauthorized" });
  }
};

export default authAdmin;
