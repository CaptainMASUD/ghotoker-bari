import multer from 'multer';

const storage = multer.memoryStorage(); // Store files in memory
const upload = multer({
  storage,
  // Remove the limits option if you don't want any file size limit
  limits: {}, // No file size limit
});

export default upload;
