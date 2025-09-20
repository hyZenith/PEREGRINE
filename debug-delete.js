// Simplified deletePost function for debug purposes
async function deletePost(postId) {
  try {
    console.log("Delete function called with ID:", postId);

    // Check for token
    const token = localStorage.getItem("token");
    if (!token) {
      alert("You must be logged in as admin to delete posts.");
      return;
    }

    // Confirm deletion
    if (
      !confirm(
        `Are you sure you want to delete this post?\n\nPost ID: ${postId}\n\nThis action cannot be undone.`
      )
    ) {
      console.log("Deletion cancelled by user");
      return;
    }

    // Use the simplest possible approach
    console.log(`Sending DELETE request to ${API_URL}/posts/${postId}`);

    // Show loading indicator
    const statusDiv = document.createElement("div");
    statusDiv.textContent = "Deleting post...";
    statusDiv.style.padding = "10px";
    statusDiv.style.backgroundColor = "#ffffd0";
    statusDiv.style.position = "fixed";
    statusDiv.style.top = "10px";
    statusDiv.style.right = "10px";
    statusDiv.style.zIndex = "9999";
    statusDiv.style.borderRadius = "4px";
    document.body.appendChild(statusDiv);

    // Simple fetch request
    const response = await fetch(`${API_URL}/posts/${postId}`, {
      method: "DELETE",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
    });

    // Log response details
    console.log("Response status:", response.status);
    console.log("Response status text:", response.statusText);

    // Try to parse response
    let responseText;
    try {
      responseText = await response.text();
      console.log("Raw response:", responseText);

      // Try to parse as JSON if possible
      if (responseText && responseText.trim().startsWith("{")) {
        const jsonData = JSON.parse(responseText);
        console.log("Response JSON:", jsonData);
      }
    } catch (e) {
      console.log("Could not parse response as text:", e);
    }

    // Remove the status indicator
    document.body.removeChild(statusDiv);

    if (response.ok) {
      // Success - show message and reload
      alert("Post deleted successfully!");
      window.location.reload(); // Simplest way to refresh the page
    } else {
      // Error - show detailed message
      alert(
        `Error deleting post: ${response.status} ${
          response.statusText
        }\n\nDetails: ${responseText || "No details available"}`
      );
    }
  } catch (error) {
    console.error("Error deleting post:", error);
    alert(
      "An error occurred while trying to delete the post: " + error.message
    );
  }
}
