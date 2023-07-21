import multer from 'multer';
import path from 'path';

const upload = multer({
  storage: multer.diskStorage({
    destination: path.join('uploads'),
    filename: function (req, file, cb) {
      const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
      cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname).toLowerCase());
    },
  }),

  limits: { fileSize: 20000000 }, // This limits file size to 2 million bytes(2mb)

  fileFilter: (req, file, cb) => {
    const validFileTypes = /txt/; // Create regex to match jpg and png

    // Do the regex match to check if file extenxion match
    const extname = validFileTypes.test(path.extname(file.originalname).toLowerCase());

    if (extname === true) {
      // Return true and file is saved
      return cb(null, true);
    } else {
      // Return error message if file extension does not match
      return cb('Error: TextFiles Only Only!');
    }
  },
});

export default upload;
