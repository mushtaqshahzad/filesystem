import express from 'express';
const router = express.Router();

import upload from '../config/multer.js';

import { deleteFile, getFiles, moveFile, copyFile, searchFiles, downloadFile, copyFolder, moveFolder, deleteFolder } from '../controllers/files.js';

router
  .get('/', getFiles)
  .copy('/copy', copyFile)
  .copy('/copyFolder', copyFolder)
  .patch('/move', moveFile)
  .patch('/moveFolder', moveFolder)
  .delete('/delete', deleteFile)
  .delete('/deleteFolder', deleteFolder)
  .post('/search', searchFiles)
  .get('/download', downloadFile)
  .post('/upload', upload.single('file'), (req, res) => {
    const { file } = req;
    if (file) {
      return res.status(201).send('File Uploaded Successfully');
    }
    return res.status(400).send('File Not Uploaded');
  });

export default router;
