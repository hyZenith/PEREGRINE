// This is a simple script to test the delete post functionality
// Run it in the browser console on the admin.html page

function testDeleteEndpoint() {
  // Get all posts
  fetch("http://localhost:3000/posts")
    .then((response) => response.json())
    .then((posts) => {
      console.log("All posts:", posts);

      if (posts.length === 0) {
        console.log("No posts found to delete.");
        return;
      }

      // Pick the first post
      const postToDelete = posts[0];
      const postId = postToDelete._id;
      console.log("Attempting to delete post:", postToDelete);
      console.log("Post ID:", postId);

      // Get the token
      const token = localStorage.getItem("token");
      if (!token) {
        console.log("No token found. Please login first.");
        return;
      }

      // Try to delete the post
      return fetch(`http://localhost:3000/posts/${postId}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });
    })
    .then((response) => {
      if (!response) return; // This happens if there were no posts

      console.log("Response status:", response.status);
      console.log("Response status text:", response.statusText);

      return response.text().then((text) => {
        try {
          // Try to parse as JSON
          const json = JSON.parse(text);
          console.log("Response JSON:", json);
          return json;
        } catch (e) {
          // Not JSON, return as text
          console.log("Response text:", text);
          return text;
        }
      });
    })
    .then((data) => {
      if (data) {
        console.log("Final result:", data);
      }
    })
    .catch((error) => {
      console.error("Error in test script:", error);
    });
}

// Run the test
testDeleteEndpoint();

// You can also check all post IDs in the database with:
function getAllPostIds() {
  fetch("http://localhost:3000/posts")
    .then((response) => response.json())
    .then((posts) => {
      console.log("All post IDs:");
      posts.forEach((post, index) => {
        console.log(`${index + 1}. ID: ${post._id}`);
      });
    })
    .catch((error) => {
      console.error("Error getting posts:", error);
    });
}
