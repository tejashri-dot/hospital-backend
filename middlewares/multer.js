import multer from "multer";

// multer cha disk storage cha user karun apn file uplaod krto yamde 3 parameter ahet req,file,callback
// req hi apn keleli req for file uplaod , file mhanje user ne upload keleli file ahe
// callback mhanje apn file upload kela ki to callback function call kela jato tyamde file nsel tr null ani kute file upload karychi tya folder ch name ast

const storage = multer.diskStorage({
  filename: (req, file, callback) => {
    callback(null, file.originalname);
  },
});
const upload = multer({ storage });


export default upload;
