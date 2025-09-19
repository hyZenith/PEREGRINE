// Constants
const API_URL = "http://localhost:3000";

// DOM Elements
const userNameElement = document.getElementById("user-name");
const logoutBtn = document.getElementById("logout-btn");
const createPostBtn = document.getElementById("create-post-btn");
const postContentInput = document.getElementById("post-content");
const postStatus = document.getElementById("post-status");
const postsContainer = document.getElementById("posts-container");
const commentsContainer = document.getElementById("comments-container");
const summariesContainer = document.getElementById("summaries-container");
const positiveCountElement = document.getElementById("positive-count");
const negativeCountElement = document.getElementById("negative-count");
const neutralCountElement = document.getElementById("neutral-count");

// Sentiment chart
let sentimentChart = null;

// Check if user is admin
function checkAdminStatus() {
  const token = localStorage.getItem("token");
  const isAdmin = localStorage.getItem("isAdmin") === "true";

  if (!token || !isAdmin) {
    // Redirect to home page if not admin
    window.location.href = "home.html";
    return;
  }

  // Update admin name display
  const userName = localStorage.getItem("userName");
  if (userName) {
    userNameElement.textContent = userName;
  }
}

// Logout functionality
logoutBtn.addEventListener("click", (e) => {
  e.preventDefault();
  localStorage.removeItem("token");
  localStorage.removeItem("userId");
  localStorage.removeItem("userName");
  localStorage.removeItem("isAdmin");
  window.location.href = "index.html";
});

// Create post
createPostBtn.addEventListener("click", async () => {
  const content = postContentInput.value.trim();

  if (!content) {
    showStatusMessage("error", "Post content cannot be empty.");
    return;
  }

  try {
    const token = localStorage.getItem("token");
    if (!token) return;

    const response = await fetch(`${API_URL}/admin/posts`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ content }),
    });

    const data = await response.json();

    if (response.ok) {
      showStatusMessage("success", "Post created successfully!");
      postContentInput.value = "";

      // Reload posts
      loadPosts();
    } else {
      showStatusMessage("error", data.message || "Failed to create post.");
    }
  } catch (error) {
    console.error("Error creating post:", error);
    showStatusMessage("error", "Server error. Please try again later.");
  }
});

// Show status message
function showStatusMessage(type, message) {
  postStatus.textContent = message;
  postStatus.className = "status-message";
  postStatus.classList.add(type);

  // Auto-hide after 5 seconds
  setTimeout(() => {
    postStatus.style.display = "none";
    postStatus.className = "status-message";
  }, 5000);
}

// Load posts
async function loadPosts() {
  try {
    const token = localStorage.getItem("token");
    if (!token) return;

    const response = await fetch(`${API_URL}/posts`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    if (!response.ok) {
      throw new Error("Failed to fetch posts");
    }

    const posts = await response.json();
    renderPosts(posts);
    renderCommentSentiments(posts);
  } catch (error) {
    console.error("Error loading posts:", error);
    postsContainer.innerHTML =
      '<div class="error-message">Failed to load posts. Please try again later.</div>';
  }
}

// Render posts
function renderPosts(posts) {
  if (!posts || posts.length === 0) {
    postsContainer.innerHTML = '<div class="no-posts">No posts yet.</div>';
    return;
  }

  postsContainer.innerHTML = "";

  posts.forEach((post) => {
    const postElement = document.createElement("div");
    postElement.className = "post";
    postElement.dataset.postId = post._id;

    const postContent = document.createElement("div");
    postContent.className = "post-content";

    const content = document.createElement("p");
    content.textContent = post.content;

    const postDate = document.createElement("div");
    postDate.className = "post-date";
    postDate.textContent = `Posted on ${formatDate(post.createdAt)}`;

    const stats = document.createElement("div");
    stats.className = "post-stats";
    stats.innerHTML = `
            <span>Likes: ${post.likes || 0}</span>
            <span>Comments: ${post.comments?.length || 0}</span>
            <span>Shares: ${post.shares || 0}</span>
        `;

    // Add summary button if there are comments
    if (post.comments && post.comments.length > 0) {
      const summaryButton = document.createElement("button");
      summaryButton.textContent = "View Comment Summary";
      summaryButton.className = "summary-action";
      summaryButton.addEventListener("click", () =>
        fetchCommentSummary(post._id, post.content)
      );
      stats.appendChild(summaryButton);
    }

    postContent.appendChild(content);
    postContent.appendChild(postDate);
    postContent.appendChild(stats);

    postElement.appendChild(postContent);
    postsContainer.appendChild(postElement);
  });
}

// Render comment sentiments
function renderCommentSentiments(posts) {
  // Collect all comments from all posts
  const allComments = [];
  posts.forEach((post) => {
    if (post.comments && post.comments.length > 0) {
      post.comments.forEach((comment) => {
        allComments.push({
          postId: post._id,
          username: comment.username,
          comment: comment.comment,
          sentiment: comment.sentiment || "neutral",
          timestamp: comment.timestamp,
        });
      });
    }
  });

  // Sort comments by timestamp (most recent first)
  allComments.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));

  // Count sentiment types
  const sentimentCounts = {
    positive: 0,
    negative: 0,
    neutral: 0,
  };

  allComments.forEach((comment) => {
    sentimentCounts[comment.sentiment]++;
  });

  // Update the sentiment counters
  positiveCountElement.textContent = sentimentCounts.positive;
  negativeCountElement.textContent = sentimentCounts.negative;
  neutralCountElement.textContent = sentimentCounts.neutral;

  // Create/update sentiment chart
  createSentimentChart(sentimentCounts);

  // Render recent comments
  renderRecentComments(allComments.slice(0, 10)); // Show only the 10 most recent comments
}

// Create sentiment chart
function createSentimentChart(sentimentCounts) {
  const ctx = document.getElementById("sentimentChart").getContext("2d");

  // Destroy previous chart if it exists
  if (sentimentChart) {
    sentimentChart.destroy();
  }

  sentimentChart = new Chart(ctx, {
    type: "doughnut",
    data: {
      labels: ["Positive", "Negative", "Neutral"],
      datasets: [
        {
          data: [
            sentimentCounts.positive,
            sentimentCounts.negative,
            sentimentCounts.neutral,
          ],
          backgroundColor: [
            "rgba(76, 175, 80, 0.7)", // Green for positive
            "rgba(244, 67, 54, 0.7)", // Red for negative
            "rgba(33, 150, 243, 0.7)", // Blue for neutral
          ],
          borderColor: [
            "rgba(76, 175, 80, 1)",
            "rgba(244, 67, 54, 1)",
            "rgba(33, 150, 243, 1)",
          ],
          borderWidth: 1,
        },
      ],
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: {
          position: "bottom",
        },
        title: {
          display: true,
          text: "Comment Sentiment Distribution",
        },
      },
    },
  });
}

// Render recent comments
function renderRecentComments(comments) {
  commentsContainer.innerHTML = "";

  if (!comments || comments.length === 0) {
    commentsContainer.innerHTML =
      '<div class="no-comments">No comments yet.</div>';
    return;
  }

  comments.forEach((comment) => {
    const commentElement = document.createElement("div");
    commentElement.className = "comment-card";

    const username = document.createElement("div");
    username.className = "username";
    username.textContent = comment.username;

    const content = document.createElement("div");
    content.className = "content";
    content.textContent = comment.comment;

    const meta = document.createElement("div");
    meta.className = "meta";

    const time = document.createElement("span");
    time.className = "time";
    time.textContent = formatDate(comment.timestamp);

    const sentiment = document.createElement("span");
    sentiment.className = `sentiment-badge ${comment.sentiment}`;
    sentiment.textContent = comment.sentiment;

    meta.appendChild(time);
    meta.appendChild(sentiment);

    commentElement.appendChild(username);
    commentElement.appendChild(content);
    commentElement.appendChild(meta);

    commentsContainer.appendChild(commentElement);
  });
}

// Format date
function formatDate(dateString) {
  const date = new Date(dateString);
  return date.toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

// Fetch comment summary for a post
async function fetchCommentSummary(postId, postContent) {
  try {
    summariesContainer.innerHTML =
      '<div class="loading-message">Generating summary...</div>';

    const token = localStorage.getItem("token");
    if (!token) return;

    const response = await fetch(`${API_URL}/posts/${postId}/summary`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    const data = await response.json();

    if (!response.ok) {
      // Extract more specific error message if available
      const errorMessage = data.message || "Failed to fetch comment summary";
      throw new Error(errorMessage);
    }
    renderCommentSummary(postId, postContent, data.summary);
  } catch (error) {
    console.error("Error fetching comment summary:", error);

    // Try to get more specific error message if available
    let errorMessage = "Failed to generate summary. Please try again later.";
    if (error.message.includes("API key")) {
      errorMessage =
        "API key error. Please check the Gemini API key configuration.";
    }

    summariesContainer.innerHTML = `<div class="error-message">${errorMessage}</div>`;
  }
}

// Render comment summary
function renderCommentSummary(postId, postContent, summary) {
  summariesContainer.innerHTML = "";

  const summaryCard = document.createElement("div");
  summaryCard.className = "summary-card";

  const summaryHeader = document.createElement("div");
  summaryHeader.className = "summary-header";

  const summaryTitle = document.createElement("div");
  summaryTitle.className = "summary-title";
  summaryTitle.textContent = "Comment Summary for Post:";

  const summaryMeta = document.createElement("div");
  summaryMeta.className = "summary-meta";
  summaryMeta.textContent = `Generated on ${formatDate(new Date())}`;

  summaryHeader.appendChild(summaryTitle);
  summaryHeader.appendChild(summaryMeta);

  const postPreview = document.createElement("div");
  postPreview.className = "post-preview";
  // Only show first 100 characters of post content
  postPreview.textContent =
    postContent.length > 100
      ? `${postContent.substring(0, 100)}...`
      : postContent;

  const summaryContent = document.createElement("div");
  summaryContent.className = "summary-content";
  summaryContent.innerHTML = `<strong>Summary:</strong> ${summary}`;

  summaryCard.appendChild(summaryHeader);
  summaryCard.appendChild(postPreview);
  summaryCard.appendChild(document.createElement("hr"));
  summaryCard.appendChild(summaryContent);

  summariesContainer.appendChild(summaryCard);
}

// Run on page load
checkAdminStatus();
loadPosts();
