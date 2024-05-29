const mongoose = require("mongoose");
const { processFile } = require("../utils/fileProcessing.js"); // Assuming the file is located in the utils directory

const serviceSchema = new mongoose.Schema({
  provider_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  name: { type: String, required: true },
  description: { type: String, required: true },
  price: { type: Number, required: true },
  duration: { type: Number, required: true }, // in minutes
  filePath: { type: String, required: false },
  serviceInformation: { type: String, required: false }, // Array of service information objects
});

serviceSchema.pre("save", async function (next) {
  // Check if filePath and fileType fields are available
  if (!this.filePath || !this.fileType) {
    return next();
  }

  try {
    // Process the file to extract and summarize text
    const summary = await processFile(this.filePath, this.fileType);

    // Update the serviceInformation field with the summarized text
    this.serviceInformation = summary;
    next();
  } catch (error) {
    console.error("Error processing file:", error);
    next(error); // Pass the error to the next middleware
  }
});

module.exports = mongoose.model("Service", serviceSchema);
