const Tesseract = require('tesseract.js');
const { PDFDocument } = require('pdf-lib');
const fs = require('fs');
const openai = require('openai');

// Extract text from an image file
const extractTextFromImage = async (filePath) => {
    const { data: { text } } = await Tesseract.recognize(filePath, 'eng');
    return text;
};

// Extract text from a PDF file
const extractTextFromPDF = async (filePath) => {
    const fileBuffer = fs.readFileSync(filePath);
    const pdfDoc = await PDFDocument.load(fileBuffer);
    const pages = pdfDoc.getPages();
    let text = '';

    for (const page of pages) {
        const pageText = await page.getTextContent();
        text += pageText.items.map(item => item.str).join(' ');
    }

    return text;
};

// Summarize the text using OpenAI
const summarizeText = async (text) => {
    try {
        const response = await openai.createCompletion({
            model: "gpt-4",
            prompt: `Summarize the following content in simple English:\n\n${text}`,
            temperature: 0.4,
            max_tokens: 256,
            top_p: 1,
            frequency_penalty: 0,
            presence_penalty: 0
        });
        return response.choices[0].text.trim();
    } catch (error) {
        console.error("Error with OpenAI summarization:", error);
        throw new Error("Failed to summarize text");
    }
};

// Main function to process the file
const processFile = async (filePath, fileType) => {
    let extractedText;

    if (fileType === 'image') {
        extractedText = await extractTextFromImage(filePath);
    } else if (fileType === 'pdf') {
        extractedText = await extractTextFromPDF(filePath);
    } else {
        throw new Error("Unsupported file type");
    }

    const summary = await summarizeText(extractedText);
    return summary;
};

module.exports = {
    processFile
};
