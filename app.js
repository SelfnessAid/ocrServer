const express = require('express');
var app = express();
var router = require('./router/main')(app);
const Multer = require('multer');
const imgUpload = require('./imgUpload');


// Handles the multipart/form-data
// Adds a .file key to the request object
// the 'storage' key saves the image temporarily for in memory
// You can also pass a file path on your server and it will save the image there
const multer = Multer({
  storage: Multer.MemoryStorage,
  fileSize: 5 * 1024 * 1024
});

var server = app.listen(3000, function(){
    console.log("Ok");
})



// the multer accessing the key 'image', as defined in the `FormData` object on the front end
// Passing the uploadToGcs function as middleware to handle the uploading of request.file
router.post('/image-upload', multer.single('image'), imgUpload.uploadToGcs, function(request, response, next) {
  const data = request.body;
  if (request.file && request.file.cloudStoragePublicUrl) {
    data.imageUrl = request.file.cloudStoragePublicUrl;
  }
  response.send(data);
})

app.get('/', function(req, res){
  res.send('Hello, World');
})