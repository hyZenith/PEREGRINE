// Utility for comment summarization using Python script
const { spawn } = require("child_process");
const path = require("path");
const fs = require("fs");
require("dotenv").config();

// Function to summarize comments
const summarizeComments = (comments) => {
  return new Promise((resolve, reject) => {
    // Create a temporary file to store the comments as JSON
    const tempFilePath = path.join(__dirname, "temp_comments.json");

    // Extract only the comment texts, filter out empty comments
    const commentTexts = comments
      .filter(
        (comment) =>
          comment &&
          comment.comment &&
          typeof comment.comment === "string" &&
          comment.comment.trim()
      )
      .map((comment) => comment.comment);

    // Write comments to temporary JSON file
    fs.writeFileSync(tempFilePath, JSON.stringify(commentTexts));

    // Spawn a python process to summarize the comments
    // Use system Python since it has the required package installed
    const pythonExecutable = "python";
    console.log(`Using Python executable: ${pythonExecutable}`);
    const pythonProcess = spawn(pythonExecutable, [
      path.join(__dirname, "comment_summarizer.py"),
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
        reject(new Error(`Summarization failed with code ${code}: ${error}`));
        return;
      }

      try {
        const summary = result.trim();
        if (
          summary.startsWith("Failed to generate summary") ||
          summary.startsWith("Error")
        ) {
          reject(new Error(summary));
          return;
        }
        resolve(summary);
      } catch (err) {
        reject(new Error("Failed to parse summary result: " + err.message));
      }
    });
  });
};

module.exports = { summarizeComments };
