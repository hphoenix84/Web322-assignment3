/*********************************************************************************
* WEB322 – Assignment 03
* I declare that this assignment is my own work in accordance with Seneca Academic Policy. No part 
* of this assignment has been copied manually or electronically from any other source (including 3rd party web sites) or distributed to other students.
*
* Name: Helena Rahgozar
Student ID: 165041237
Date: 5 March
* Cyclic Web App URL: 
* GitHub Repository URL:  
********************************************************************************/
const express = require("express");
const path = require("path");
const multer = require("multer");
const cloudinary = require('cloudinary').v2;
const streamifier = require('streamifier');
const storeService = require("./store_service"); 
const app = express();
const PORT = process.env.PORT || 8080;
app.use(express.static("public"));
app.use(express.urlencoded({ extended: true }));

cloudinary.config({
    cloud_name: 'dkeoiycip',
    api_key: '124313449489885',
    api_secret: 'YbHVO2cT7frYxoi9vagf4aHLqJk',
    secure: true
});
const upload = multer();

app.get("/", (req, res) => {
    res.redirect("/about");
});

app.get("/about", (req, res) => {
    res.sendFile(path.join(__dirname, "views", "about.html"));
});

// Add Item Form
app.get("/items/add", (req, res) => {
    res.sendFile(path.join(__dirname, "views", "addItem.html"));
});

// Add New Item
app.post("/items/add", upload.single("featureImage"), (req, res) => {
    if (req.file) {
        let streamUpload = (req) => {
            return new Promise((resolve, reject) => {
                let stream = cloudinary.uploader.upload_stream((error, result) => {
                    if (result) {
                        resolve(result);
                    } else {
                        reject(error);
                    }
                });
                streamifier.createReadStream(req.file.buffer).pipe(stream);
            });
        };

        async function upload(req) {
            let result = await streamUpload(req);
            return result;
        }

        upload(req).then((uploaded) => {
            processItem(uploaded.url);
        });
    } else {
        processItem("");
    }

    function processItem(imageUrl) {
        req.body.featureImage = imageUrl;
        req.body.published = req.body.published ? true : false;

        storeService.addItem(req.body)
            .then(() => res.redirect("/items"))
            .catch(err => res.status(500).json({ message: err }));
    }
});

// Fetch all items with optional filters
app.get("/items", (req, res) => {
    if (req.query.category) {
        storeService.getItemsByCategory(req.query.category)
            .then(data => res.json(data))
            .catch(err => res.status(404).json({ message: err }));
    } else if (req.query.minDate) {
        storeService.getItemsByMinDate(req.query.minDate)
            .then(data => res.json(data))
            .catch(err => res.status(404).json({ message: err }));
    } else {
        storeService.getAllItems()
            .then(data => res.json(data))
            .catch(err => res.status(404).json({ message: err }));
    }
});

// Fetch a single item by ID
app.get("/item/:id", (req, res) => {
    storeService.getItemById(req.params.id)
        .then(data => res.json(data))
        .catch(err => res.status(404).json({ message: err }));
});

// Categories route
app.get("/categories", (req, res) => {
    storeService.getCategories()
        .then(data => res.json(data))
        .catch(err => res.status(404).json({ message: err }));
});

// 404 Page Not Found
app.use((req, res) => {
    res.status(404).json({ message: "Page Not Found" });
});

// Initialize the store service and start the server
storeService.initialize()
    .then(() => {
        app.listen(PORT, () => {
            console.log(`Express HTTP server is running on port ${PORT}`);
        });
    })
    .catch(err => {
        console.error(`Failed to initialize data: ${err}`);
    });