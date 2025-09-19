// This is a utility file to load and use the sentiment analysis model

const { spawn } = require("child_process");
const path = require("path");
const fs = require("fs");

// Function to analyze sentiment of a comment
const analyzeSentiment = (comment) => {
  return new Promise((resolve, reject) => {
    // Create a temporary file to store the comment
    const tempFilePath = path.join(__dirname, "temp_comment.txt");
    fs.writeFileSync(tempFilePath, comment);

    // Spawn a python process to analyze the sentiment
    const pythonProcess = spawn("python", [
      path.join(__dirname, "sentiment_analyzer.py"),
      tempFilePath,
    ]);

    let result = "";
    let error = "";

    // Collect data from the python script
    pythonProcess.stdout.on("data", (data) => {
      result += data.toString();
    });

    pythonProcess.stderr.on("data", (data) => {
      error += data.toString();
    });

    // When the process exits
    pythonProcess.on("close", (code) => {
      // Delete the temporary file
      try {
        fs.unlinkSync(tempFilePath);
      } catch (err) {
        console.error("Error deleting temporary file:", err);
      }

      if (code !== 0) {
        console.error("Python process exited with code", code);
        console.error("Python error:", error);
        reject(
          new Error(`Sentiment analysis failed with code ${code}: ${error}`)
        );
        return;
      }

      try {
        const sentiment = result.trim();
        resolve(sentiment);
      } catch (err) {
        reject(new Error("Failed to parse sentiment result"));
      }
    });
  });
};

module.exports = { analyzeSentiment };
