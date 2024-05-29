// routes/ServiceProvider.js
const express = require("express");
const router = express.Router();
const multer = require("multer");
const User = require("../models/User");
//const upload = multer({ dest: "uploads/" });
const Service = require("../models/Service");
const path = require("path");
const fs = require("fs");
pdfUtil = require("pdf-to-text");
const pdfParse = require("pdf-parse");
const Tesseract = require("tesseract.js");

// Multer Configuration
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, "uploads/");
  },
  filename: function (req, file, cb) {
    const extension = path.extname(file.originalname); // Get the file extension from the original file
    cb(null, `${file.fieldname}-${Date.now()}${extension}`); // Use original filename with extension
  },
});

const upload = multer({ storage: storage }); // Specify the destination folder for uploaded files

// Get all service providers
router.get("/service-provider-page", async (req, res) => {
  try {
    const serviceProviders = await User.find({ role: "provider" });
    res.render("serviceProviders.ejs", { serviceProviders });
  } catch (err) {
    console.error("Error fetching service providers:", err);
    res.status(500).send("Server error");
  }
});

router.get("/services", async (req, res) => {
  const { email } = req.query;

  try {
    const provider = await User.findOne({ email, role: "provider" });
    if (!provider) {
      return res.status(404).send("Service provider not found.");
    }

    const services = await Service.find({ provider_id: provider._id });

    res.render("providerServices", { provider, services });
  } catch (err) {
    console.error("Error fetching services:", err);
    res.status(500).send("Server error");
  }
});

// Show form to add a new service
router.get("/add-service", (req, res) => {
  res.render("addService.ejs");
});

// Handle form submission to add a new service
router.post("/add-service", upload.single("serviceFile"), async (req, res) => {
  const { email, name, description, price, duration } = req.body;
  const serviceFile = req.file;

  console.log("Received form data:", req.body);
  console.log("Received file:", serviceFile);

  pdfUrl = "uploads/" + req.file.filename;
  let extractedText = "";

  extention = path.extname(pdfUrl);
  //console.log(extention);

  if (extention === ".pdf") {
    const pdfFile = fs.readFileSync(pdfUrl);
    pdfParse(pdfFile).then(function (data) {
      // console.log(data.text);

      extractedText = data.text;
    });
  } else {
    const result = await Tesseract.recognize(pdfUrl);

    extractedText = result.data.text;
    console.log(extractedText);
  }

  try {
    const provider = await User.findOne({ email, role: "provider" });
    if (!provider) {
      return res.status(400).send("Service provider not found");
    }
    const service = new Service({
      provider_id: provider._id,
      name,
      description,
      price,
      duration,
      // filePath: serviceFile.path,
      filePath: serviceFile ? serviceFile.path : null,
      serviceInformation: extractedText,
    });
    await service.save();
    res.redirect(`../service-provider/services?email=${provider.email}`);
  } catch (err) {
    console.error("Error adding service:", err);
    res.status(500).send("Server error");
  }
});

// Route to view the service file
router.get("/view-service-file/:id", async (req, res) => {
  try {
    const service = await Service.findById(req.params.id).populate(
      "provider_id"
    );
    if (!service) {
      return res.status(404).send("Service not found");
    }
    res.render("viewServiceFile", { service, provider: service.provider_id });
  } catch (err) {
    console.error("Error fetching service file:", err);
    res.status(500).send("Server error");
  }
});

// Route to serve files from the uploads directory
router.get("/uploads/:filename", (req, res) => {
  res.setHeader("Content-Type", "application/pdf");
  console.log(req.params.filename);
  const filePath = path.join(__dirname, "../uploads", req.params.filename);
  res.sendFile(filePath, (err) => {
    if (err) {
      console.error("Error sending file:", err);
      res.status(500).send("Something went wrong.");
    }
  });
});


router.get("/all-services", async (req, res) => {
  try {
    const services = await Service.find().populate("provider_id");
    const groupedServices = {};

    services.forEach((service) => {
      const email = service.provider_id.email;
      if (!groupedServices[email]) {
        groupedServices[email] = [];
      }
      groupedServices[email].push(service);
    });

    res.render("allServices", { groupedServices });
  } catch (err) {
    res.status(500).send(err);
  }
});

// Handle updating the service file
// router.post('/update-service-file/:id', upload.single('serviceFile'), async (req, res) => {
//     try {
//         const service = await Service.findById(req.params.id);
//         if (!service) {
//             return res.status(404).send('Service not found');
//         }
//         service.filePath = req.file.path;
//         await service.save();
//         res.redirect(/service-provider/view-service-file/${service._id});
//     } catch (err) {
//         console.error('Error updating service file:', err);
//         res.status(500).send('Server error');
//     }
// });

// // Handle deleting the service file
// router.post('/delete-service-file/:id', async (req, res) => {
//     try {
//         const service = await Service.findById(req.params.id);
//         if (!service) {
//             return res.status(404).send('Service not found');
//         }
//         service.filePath = null;
//         await service.save();
//         res.redirect(/service-provider/view-service-file/${service._id});
//     } catch (err) {
//         console.error('Error deleting service file:', err);
//         res.status(500).send('Server error');
//     }
// });

module.exports = router;