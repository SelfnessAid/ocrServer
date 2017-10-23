// const express = require('express');
// var app = express();
// var router = require('./router/main')(app);

// const imgUpload = require('./imgUpload');


// // Handles the multipart/form-data
// // Adds a .file key to the request object
// // the 'storage' key saves the image temporarily for in memory
// // You can also pass a file path on your server and it will save the image there
// const multer = Multer({
//   storage: Multer.MemoryStorage,
//   fileSize: 5 * 1024 * 1024
// });

// // the multer accessing the key 'image', as defined in the `FormData` object on the front end
// // Passing the uploadToGcs function as middleware to handle the uploading of request.file
// app.post('/upload', multer.single('image'), imgUpload.uploadToGcs, function(request, response, next) {
//   // const data = request.body;
//   // if (request.file && request.file.cloudStoragePublicUrl) {
//   //   data.imageUrl = request.file.cloudStoragePublicUrl;
//   // }
//   // response.send(data);

//   if (!req.file) {
//     res.status(400).send("No file uploaded.");
//     return;
//   }

//   // Create a new blob in the bucket and upload the file data.
//   const blob = bucket.file(req.file.originalname);

//   // Make sure to set the contentType metadata for the browser to be able
//   // to render the image instead of downloading the file (default behavior)
//   const blobStream = blob.createWriteStream({
//     metadata: {
//       contentType: req.file.mimetype
//     }
//   });

//   blobStream.on("error", err => {
//     next(err);
//     return;
//   });

//   blobStream.on("finish", () => {
//     // The public URL can be used to directly access the file via HTTP.
//     const publicUrl = `https://storage.googleapis.com/${bucket.name}/${blob.name}`;

//     // Make the image public to the web (since we'll be displaying it in browser)
//     blob.makePublic().then(() => {
//       res.status(200).send(`Success!\n Image uploaded to ${publicUrl}`);
//     });
//   });

//   blobStream.end(req.file.buffer);
// })

// app.get('/', function(req, res){
//   res.send('Hello, World');
// })

// const PORT = process.env.PORT || 8080;
// app.listen(PORT, ()=>{
//   console.log(`Application listening on port ${PORT}`);
//   console.log("Press Ctrl+C to quit.");
// });

// import multer, {memoryStorage} from "multer";
const express = require('express');
const storage = require('@google-cloud/storage');
const Multer = require('multer');
const path = require('path');
// import path from "path";

// Instantiate a storage client
const googleCloudStorage = storage({
  projectId: process.env.GCLOUD_STORAGE_BUCKET || 'm3t3r-app',
  keyFilename: process.env.GCLOUD_KEY_FILE || 'M3T3R-bbbccb888201.json'
});

// Instantiate an express server
const app = express();

// Multer is required to process file uploads and make them available via
// req.files.

const m = Multer({
  storage: Multer.MemoryStorage,
  fileSize: 5 * 1024 * 1024
});
// const m = multer({
//   storage: memoryStorage(),
//   limits: {
//     fileSize: 5 * 1024 * 1024 // no larger than 5mb
//   }
// });

// A bucket is a container for objects (files).
const bucket = googleCloudStorage.bucket(process.env.GCLOUD_STORAGE_BUCKET || 'm3t3r-app');

// Display a form for uploading files.
app.get("/", (req, res) => {
  res.sendFile(path.join(`${__dirname}/index.html`));
});

// Process the file upload and upload to Google Cloud Storage.
app.post("/upload", m.single("file"), (req, res, next) => {
  if (!req.file) {
    res.status(400).send("No file uploaded.");
    return;
  }

  // Create a new blob in the bucket and upload the file data.
  const blob = bucket.file(req.file.originalname);

  // Make sure to set the contentType metadata for the browser to be able
  // to render the image instead of downloading the file (default behavior)
  const blobStream = blob.createWriteStream({
    metadata: {
      contentType: req.file.mimetype
    }
  });

  blobStream.on("error", err => {
    next(err);
    return;
  });

  blobStream.on("finish", () => {
    // The public URL can be used to directly access the file via HTTP.
    const publicUrl = `https://storage.googleapis.com/${bucket.name}/${blob.name}`;

    // Make the image public to the web (since we'll be displaying it in browser)
    blob.makePublic().then(() => {
      res.status(200).send(`Success!\n Image uploaded to ${publicUrl}`);
    });
  });

  blobStream.end(req.file.buffer);
});

const PORT = process.env.PORT || 8080;
app.listen(PORT, () => {
  console.log(`App listening on port ${PORT}`);
  console.log("Press Ctrl+C to quit.");
});