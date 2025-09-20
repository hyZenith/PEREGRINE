// Constants
const API_URL = "http://localhost:3000";

// Helper function to format dates
function formatDate(dateString) {
  const date = new Date(dateString);
  return date.toLocaleDateString() + " " + date.toLocaleTimeString();
}

// Test function for debugging
window.testViewComments = function () {
  console.log("Testing View Comments functionality...");
  // Use the known post ID from the API response we saw earlier
  const testPostId = "68cda93276e49b3f9aef2e78"; // Money related issues post
  showPostComments(testPostId);
};

// DOM Elements
const userNameElement = document.getElementById("user-name");
const logoutBtn = document.getElementById("logout-btn");
const postsContainer = document.getElementById("posts-container");
const commentsContainer = document.getElementById("comments-container");
const summariesContainer = document.getElementById("summaries-container");
const positiveCountElement = document.getElementById("positive-count");
const negativeCountElement = document.getElementById("negative-count");
const neutralCountElement = document.getElementById("neutral-count");
const commentsFilterSelect = document.getElementById("comments-filter");
const commentsFilterCount = document.getElementById("comments-filter-count");

// File handling
let selectedFiles = [];

// Sentiment chart
let sentimentChart = null;

// Cache for posts and comments to support filtering without re-fetching
let cachedPosts = [];
let cachedAllComments = [];
let currentCommentsFilter = "all"; // all | positive | negative | neutral

// Initialize when DOM is loaded
document.addEventListener("DOMContentLoaded", function () {
  console.log("DOM loaded, initializing...");
  initializeApp();
});

function initializeApp() {
  // Check admin status
  checkAdminStatus();

  // Setup form elements
  setupFormElements();

  // Setup file upload
  setupFileUpload();

  // Setup comments filter UI (if present on this page)
  setupCommentsFilter();

  // Load posts
  loadPosts();
}

function setupFormElements() {
  const createPostBtn = document.getElementById("create-post-btn");
  const saveDraftBtn = document.getElementById("save-draft-btn");

  if (createPostBtn) {
    createPostBtn.addEventListener("click", function (e) {
      e.preventDefault();
      console.log("Publishing post...");
      createPost(false);
    });
  }

  if (saveDraftBtn) {
    saveDraftBtn.addEventListener("click", function (e) {
      e.preventDefault();
      console.log("Saving draft...");
      createPost(true);
    });
  }

  console.log("Form elements initialized");
}

function setupFileUpload() {
  const uploadArea = document.getElementById("file-upload-area");
  const uploadInput = document.getElementById("file-upload");
  const fileList = document.getElementById("file-list");

  if (!uploadArea || !uploadInput) return;

  uploadArea.addEventListener("click", () => uploadInput.click());

  uploadArea.addEventListener("dragover", (e) => {
    e.preventDefault();
    uploadArea.classList.add("drag-over");
  });

  uploadArea.addEventListener("dragleave", (e) => {
    e.preventDefault();
    uploadArea.classList.remove("drag-over");
  });

  uploadArea.addEventListener("drop", (e) => {
    e.preventDefault();
    uploadArea.classList.remove("drag-over");
    const files = Array.from(e.dataTransfer.files);
    handleFileSelection(files);
  });

  uploadInput.addEventListener("change", (e) => {
    const files = Array.from(e.target.files);
    handleFileSelection(files);
  });
}

function handleFileSelection(files) {
  const fileList = document.getElementById("file-list");

  files.forEach((file) => {
    if (file.type.startsWith("image/") || file.type === "application/pdf") {
      selectedFiles.push(file);
      addFileToList(file, fileList);
    } else {
      alert(
        `File ${file.name} is not supported. Please upload images or PDFs only.`
      );
    }
  });
}

function addFileToList(file, fileListContainer) {
  if (!fileListContainer) return;

  const fileItem = document.createElement("div");
  fileItem.className = "file-item";

  const fileName = document.createElement("span");
  fileName.textContent = `${file.name} (${formatFileSize(file.size)})`;

  const removeBtn = document.createElement("button");
  removeBtn.textContent = "Remove";
  removeBtn.addEventListener("click", () => {
    const index = selectedFiles.indexOf(file);
    if (index > -1) selectedFiles.splice(index, 1);
    fileItem.remove();
  });

  fileItem.appendChild(fileName);
  fileItem.appendChild(removeBtn);
  fileListContainer.appendChild(fileItem);
}

function formatFileSize(bytes) {
  if (bytes === 0) return "0 Bytes";
  const k = 1024;
  const sizes = ["Bytes", "KB", "MB", "GB"];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
}

async function createPost(isDraft = false) {
  try {
    console.log("Creating post, isDraft:", isDraft);

    // Get form values
    const titleInput = document.getElementById("post-title");
    const contentInput = document.getElementById("post-content");
    const linkInput = document.getElementById("embed-link");

    const title = titleInput ? titleInput.value.trim() : "";
    const content = contentInput ? contentInput.value.trim() : "";
    const embedLink = linkInput ? linkInput.value.trim() : "";

    console.log("Form data:", {
      title,
      content,
      embedLink,
      files: selectedFiles.length,
    });

    // Validation
    if (!content && (!selectedFiles || selectedFiles.length === 0)) {
      alert("Please add some content or upload files to create a post.");
      return;
    }

    // Get auth token
    const token = localStorage.getItem("token");
    if (!token) {
      alert("Please login first.");
      return;
    }

    // Prepare request
    const formData = new FormData();
    formData.append("title", title);
    formData.append(
      "content",
      content || `Shared ${selectedFiles.length} file(s)`
    );
    formData.append("embedLink", embedLink);
    formData.append("isDraft", isDraft.toString());

    // Add files
    selectedFiles.forEach((file) => {
      formData.append("files", file);
    });

    console.log("Sending request to:", `${API_URL}/admin/posts`);

    // Make request
    const response = await fetch(`${API_URL}/admin/posts`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
      },
      body: formData,
    });

    console.log("Response status:", response.status);

    if (response.ok) {
      const data = await response.json();
      console.log("Success:", data);

      const message = isDraft
        ? "Post saved as draft!"
        : "Post published successfully!";
      alert(message);

      // Clear form
      if (titleInput) titleInput.value = "";
      if (contentInput) contentInput.value = "";
      if (linkInput) linkInput.value = "";
      selectedFiles = [];

      const fileListContainer = document.getElementById("file-list");
      if (fileListContainer) fileListContainer.innerHTML = "";

      const uploadInput = document.getElementById("file-upload");
      if (uploadInput) uploadInput.value = "";

      // Reload posts
      loadPosts();
    } else {
      const errorData = await response.text();
      console.error("Error:", errorData);
      alert(`Error: ${response.status} - ${errorData}`);
    }
  } catch (error) {
    console.error("Network error:", error);
    alert(`Network error: ${error.message}`);
  }
}

// Check if user is admin
function checkAdminStatus() {
  const token = localStorage.getItem("token");
  const isAdmin = localStorage.getItem("isAdmin") === "true";

  if (!token || !isAdmin) {
    alert("Access denied. Admin only.");
    window.location.href = "index.html";
    return;
  }

  // Update admin name display
  const userName = localStorage.getItem("userName");
  if (userName && userNameElement) {
    userNameElement.textContent = userName;
  }
}

// Logout functionality
if (logoutBtn) {
  logoutBtn.addEventListener("click", (e) => {
    e.preventDefault();
    localStorage.removeItem("token");
    localStorage.removeItem("userId");
    localStorage.removeItem("userName");
    localStorage.removeItem("isAdmin");
    window.location.href = "index.html";
  });
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
  // Cache posts
  cachedPosts = posts || [];
  // Build flat comments cache for filtering
  cachedAllComments = buildFlatComments(cachedPosts);

  renderPosts(cachedPosts);
  // Populate Recent Comments panel using current filter
  renderRecentComments(cachedAllComments, currentCommentsFilter);
  // Update sentiment chart and counters
  renderCommentSentiments(cachedPosts);
  } catch (error) {
    console.error("Error loading posts:", error);
    if (postsContainer) {
      postsContainer.innerHTML =
        '<div class="error-message">Failed to load posts. Please try again later.</div>';
    }
  }
}

// Render posts
function renderPosts(posts) {
  if (!postsContainer) return;

  if (!posts || posts.length === 0) {
    postsContainer.innerHTML = '<div class="no-posts">No posts yet.</div>';
    return;
  }

  postsContainer.innerHTML = "";

  posts.forEach((post) => {
    const postElement = document.createElement("div");
    postElement.className = "admin-post";
    postElement.innerHTML = `
      <div class="post-header">
        <div class="post-id">Post ID: ${post._id}</div>
        <div class="post-date">Posted on ${formatDate(post.createdAt)}</div>
      </div>
      ${post.title ? `<div class="post-title">${post.title}</div>` : ""}
      <div class="post-content">
        <p>${post.content}</p>
      </div>
      ${
        post.embedLink
          ? `<div class="embed-link"><a href="${post.embedLink}" target="_blank">${post.embedLink}</a></div>`
          : ""
      }
      ${
        post.attachments && post.attachments.length > 0
          ? renderAttachments(post.attachments)
          : ""
      }
      ${post.isDraft ? '<div class="draft-badge">DRAFT</div>' : ""}
      <div class="post-stats">
        <div class="stat-item"><i class="fas fa-thumbs-up"></i> ${
          post.likes
        } Likes</div>
        <div class="stat-item"><i class="fas fa-comment"></i> ${
          post.comments ? post.comments.length : 0
        } Comments</div>
        <div class="stat-item"><i class="fas fa-share"></i> ${
          post.shares
        } Shares</div>
      </div>
      <div class="post-actions">
        <button class="view-comments-btn" data-post-id="${
          post._id
        }">View Comments</button>
        <button class="generate-summary-btn" data-post-id="${
          post._id
        }" data-post-content="${post.content.replace(
      /"/g,
      "&quot;"
    )}">Generate Summary</button>
        <button class="delete-post-btn" onclick="showDeleteConfirmation('${
          post._id
        }')">Delete Post</button>
      </div>
    `;
    postsContainer.appendChild(postElement);
  });

  // Add event listeners for the buttons
  addPostActionListeners();
}

// Add event listeners for post action buttons
function addPostActionListeners() {
  console.log("Adding event listeners...");

  // View Comments buttons
  const viewCommentsButtons = document.querySelectorAll(".view-comments-btn");
  console.log("Found", viewCommentsButtons.length, "view comments buttons");

  viewCommentsButtons.forEach((button, index) => {
    console.log("Adding listener to button", index);
    button.addEventListener("click", function (e) {
      e.preventDefault();
      console.log("View Comments button clicked!");
      const postId = this.getAttribute("data-post-id");
      console.log("Post ID:", postId);
      showPostComments(postId);
    });
  });

  // Generate Summary buttons
  const generateSummaryButtons = document.querySelectorAll(
    ".generate-summary-btn"
  );
  console.log(
    "Found",
    generateSummaryButtons.length,
    "generate summary buttons"
  );

  generateSummaryButtons.forEach((button, index) => {
    console.log("Adding listener to summary button", index);
    button.addEventListener("click", function (e) {
      e.preventDefault();
      console.log("Generate Summary button clicked!");
      const postId = this.getAttribute("data-post-id");
      const postContent = this.getAttribute("data-post-content");
      console.log("Post ID:", postId, "Content:", postContent);
      fetchCommentSummary(postId, postContent);
    });
  });
}

function renderAttachments(attachments) {
  if (!attachments || attachments.length === 0) return "";

  let html = '<div class="post-attachments">';
  attachments.forEach((attachment) => {
    if (attachment.mimetype.startsWith("image/")) {
      html += `<div class="attachment-item">
        <img src="uploads/${attachment.filename}" alt="${attachment.originalname}" class="attachment-image" />
      </div>`;
    } else if (attachment.mimetype === "application/pdf") {
      html += `<div class="attachment-item">
        <a href="uploads/${attachment.filename}" target="_blank" class="attachment-pdf">
          <i class="fas fa-file-pdf"></i> ${attachment.originalname}
        </a>
      </div>`;
    }
  });
  html += "</div>";
  return html;
}

// Render the Recent Comments section from all posts
function buildFlatComments(posts) {
  const allComments = [];
  (posts || []).forEach((post) => {
    (post.comments || []).forEach((c) => {
      allComments.push({
        postId: post._id,
        postTitle:
          post.title || (post.content ? post.content.slice(0, 50) : "Untitled"),
        comment: c.comment,
        username: c.username || "Anonymous",
        sentiment: (c.sentiment || "neutral").toLowerCase(),
        timestamp: c.timestamp || post.createdAt,
      });
    });
  });
  // Sort by timestamp desc
  allComments.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
  return allComments;
}

function setupCommentsFilter() {
  if (!commentsFilterSelect) return;
  // Restore previous choice if any
  if (currentCommentsFilter) {
    commentsFilterSelect.value = currentCommentsFilter;
  }
  commentsFilterSelect.addEventListener("change", () => {
    currentCommentsFilter = commentsFilterSelect.value;
    renderRecentComments(cachedAllComments, currentCommentsFilter);
  });
}

// Render the Recent Comments section from cache with filter
function renderRecentComments(allCommentsInput, filter = "all") {
  try {
    if (!commentsContainer) return;
    const allComments = Array.isArray(allCommentsInput)
      ? allCommentsInput
      : buildFlatComments(allCommentsInput || []);

    // Apply filter
    let filtered = allComments;
    if (filter && filter !== "all") {
      filtered = allComments.filter((c) => c.sentiment === filter);
    }

    // Update filter count badge
    if (commentsFilterCount) {
      commentsFilterCount.textContent = String(filtered.length);
      commentsFilterCount.title = `${filtered.length} ${
        filter === "all" ? "total" : filter
      } comments`;
    }

    if (filtered.length === 0) {
      commentsContainer.innerHTML = '<div class="loading-message">No comments yet.</div>';
      return;
    }

    // Build HTML
    const html = filtered
      .map((c) => {
        const badgeColor = c.sentiment === 'positive' ? '#4CAF50' : c.sentiment === 'negative' ? '#F44336' : '#9E9E9E';
        const safePostTitle = c.postTitle.replace(/</g, '&lt;').replace(/>/g, '&gt;');
        const safeComment = (c.comment || '').replace(/</g, '&lt;').replace(/>/g, '&gt;');
        return `
        <div class="admin-post" style="padding:12px; margin-bottom:10px;">
          <div style="display:flex; justify-content:space-between; align-items:center;">
            <div style="font-weight:600; color:#1877f2;">${c.username}</div>
            <div style="font-size:12px; color:#666;">${formatDate(c.timestamp)}</div>
          </div>
          <div style="margin:6px 0 8px 0; line-height:1.4;">${safeComment}</div>
          <div style="display:flex; justify-content:space-between; align-items:center;">
            <div style="font-size:12px; color:#444;">Post: <span style="color:#1877f2;">${safePostTitle}</span></div>
            <span style="font-size:12px; background:${badgeColor}; color:white; padding:2px 8px; border-radius:999px; text-transform:capitalize;">${c.sentiment}</span>
          </div>
        </div>`;
      })
      .join("");

    commentsContainer.innerHTML = html;
  } catch (err) {
    console.error("renderRecentComments error:", err);
    if (commentsContainer) {
      commentsContainer.innerHTML = '<div class="error-message">Failed to load recent comments.</div>';
    }
  }
}

// Render comment sentiments (aggregate across all posts and draw chart)
function renderCommentSentiments(posts) {
  try {
    if (!Array.isArray(posts)) {
      console.warn("renderCommentSentiments: posts is not an array");
      return;
    }

    // Aggregate counts
    let positive = 0;
    let negative = 0;
    let neutral = 0;

    posts.forEach((post) => {
      const comments = Array.isArray(post.comments) ? post.comments : [];
      comments.forEach((c) => {
        const s = (c.sentiment || "").toString().toLowerCase().trim();
        if (s === "positive") positive++;
        else if (s === "negative") negative++;
        else if (s === "neutral") neutral++;
        else neutral++; // fallback for unknown/missing sentiments
      });
    });

    // Update counters in UI if present
    if (positiveCountElement)
      positiveCountElement.textContent = positive.toString();
    if (negativeCountElement)
      negativeCountElement.textContent = negative.toString();
    if (neutralCountElement)
      neutralCountElement.textContent = neutral.toString();

    const total = positive + negative + neutral;
    const canvas = document.getElementById("sentimentChart");
    if (!canvas) {
      console.warn("renderCommentSentiments: #sentimentChart canvas not found");
      return;
    }

    // If no data, clear chart and return
    if (total === 0) {
      if (sentimentChart && typeof sentimentChart.destroy === "function") {
        sentimentChart.destroy();
        sentimentChart = null;
      }
      return;
    }

    const ctx = canvas.getContext("2d");
    if (!ctx) {
      console.warn("renderCommentSentiments: 2D context not available");
      return;
    }

    // Guard if Chart.js not loaded
    if (typeof Chart === "undefined") {
      console.warn("renderCommentSentiments: Chart.js not available");
      return;
    }

    const data = [positive, negative, neutral];

    if (sentimentChart) {
      // Update existing chart
      sentimentChart.data.datasets[0].data = data;
      sentimentChart.update();
    } else {
      // Create new chart
      sentimentChart = new Chart(ctx, {
        type: "doughnut",
        data: {
          labels: ["Positive", "Negative", "Neutral"],
          datasets: [
            {
              data,
              backgroundColor: ["#4CAF50", "#F44336", "#9E9E9E"],
              hoverBackgroundColor: ["#43A047", "#E53935", "#757575"],
              borderWidth: 0,
            },
          ],
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          plugins: {
            legend: { position: "bottom" },
            tooltip: {
              callbacks: {
                label: function (context) {
                  const label = context.label || "";
                  const value = context.parsed || 0;
                  const pct = total ? ((value / total) * 100).toFixed(1) : 0;
                  return `${label}: ${value} (${pct}%)`;
                },
              },
            },
          },
          cutout: "60%",
        },
      });
    }
  } catch (err) {
    console.error("renderCommentSentiments error:", err);
  }
}

// Format date
function formatDate(dateString) {
  const date = new Date(dateString);
  return date.toLocaleDateString() + " at " + date.toLocaleTimeString();
}

// Delete post functions
function showDeleteConfirmation(postId) {
  if (
    confirm(
      `Are you sure you want to delete this post? This action cannot be undone.`
    )
  ) {
    deletePost(postId);
  }
}

async function deletePost(postId) {
  try {
    const token = localStorage.getItem("token");
    if (!token) {
      alert("Please login first.");
      return;
    }

    const response = await fetch(`${API_URL}/posts/${postId}`, {
      method: "DELETE",
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    if (response.ok) {
      alert("Post deleted successfully!");
      loadPosts(); // Reload posts
    } else {
      const errorData = await response.text();
      alert(`Failed to delete post: ${errorData}`);
    }
  } catch (error) {
    console.error("Error deleting post:", error);
    alert("Error deleting post. Please try again.");
  }
}

// Comment and summary functions (placeholders)
// Show comments for a specific post
function showPostComments(postId) {
  console.log("=== showPostComments called ===");
  console.log("Post ID:", postId);

  // Remove any existing modal
  const existingModal = document.getElementById("comments-modal");
  if (existingModal) {
    console.log("Removing existing modal");
    existingModal.remove();
  }

  // Create a modal-like container for comments
  const commentsContainer = document.createElement("div");
  commentsContainer.id = "comments-modal";
  commentsContainer.style.cssText = `
    position: fixed;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background-color: rgba(0, 0, 0, 0.7);
    display: flex;
    justify-content: center;
    align-items: center;
    z-index: 1000;
  `;

  const modalContent = document.createElement("div");
  modalContent.style.cssText = `
    background: white;
    padding: 30px;
    border-radius: 10px;
    max-width: 600px;
    max-height: 80vh;
    overflow-y: auto;
    position: relative;
    box-shadow: 0 4px 20px rgba(0,0,0,0.3);
  `;

  const closeButton = document.createElement("button");
  closeButton.innerHTML = "×";
  closeButton.style.cssText = `
    position: absolute;
    top: 10px;
    right: 15px;
    background: none;
    border: none;
    font-size: 24px;
    cursor: pointer;
    color: #666;
  `;
  closeButton.onclick = () => {
    console.log("Closing modal");
    document.body.removeChild(commentsContainer);
  };

  const title = document.createElement("h3");
  title.textContent = "Comments";
  title.style.marginBottom = "15px";
  title.style.color = "#333";

  const commentsDiv = document.createElement("div");
  commentsDiv.id = "comments-list";
  commentsDiv.innerHTML =
    '<div style="text-align: center; padding: 20px; color: #666;">Loading comments...</div>';

  modalContent.appendChild(closeButton);
  modalContent.appendChild(title);
  modalContent.appendChild(commentsDiv);
  commentsContainer.appendChild(modalContent);
  document.body.appendChild(commentsContainer);

  console.log("Modal created and added to body");

  // Fetch the specific post to get its comments
  const token = localStorage.getItem("token");
  console.log("Token:", token ? "Found" : "Not found");

  fetch(`${API_URL}/posts`, {
    headers: { Authorization: `Bearer ${token}` },
  })
    .then((response) => {
      console.log("API response status:", response.status);
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      return response.json();
    })
    .then((posts) => {
      console.log("Received posts:", posts.length);
      const post = posts.find((p) => p._id === postId);
      console.log("Found post:", post ? "Yes" : "No");

      const commentsList = document.getElementById("comments-list");

      if (post && post.comments && post.comments.length > 0) {
        console.log("Post has", post.comments.length, "comments");
        commentsList.innerHTML = "";
        post.comments.forEach((comment, index) => {
          console.log("Rendering comment", index, comment);
          const commentDiv = document.createElement("div");
          commentDiv.style.cssText = `
          padding: 15px;
          border-bottom: 1px solid #eee;
          margin-bottom: 10px;
          background: #f9f9f9;
          border-radius: 5px;
        `;

          commentDiv.innerHTML = `
          <div style="font-weight: bold; color: #1877f2; margin-bottom: 5px;">${
            comment.username || "Anonymous"
          }</div>
          <div style="margin: 8px 0; line-height: 1.4;">${
            comment.comment || "No content"
          }</div>
          <div style="font-size: 12px; color: #666;">
            ${
              comment.sentiment
                ? `Sentiment: <span style="font-weight: bold;">${comment.sentiment}</span>`
                : ""
            }
            ${comment.timestamp ? ` • ${formatDate(comment.timestamp)}` : ""}
          </div>
        `;
          commentsList.appendChild(commentDiv);
        });
      } else {
        console.log("No comments found for this post");
        commentsList.innerHTML =
          '<div style="color: #666; text-align: center; padding: 20px;">No comments yet.</div>';
      }
    })
    .catch((error) => {
      console.error("Error fetching comments:", error);
      const commentsList = document.getElementById("comments-list");
      if (commentsList) {
        commentsList.innerHTML = `<div style="color: red; text-align: center; padding: 20px;">Error loading comments: ${error.message}</div>`;
      }
    });
}

async function fetchCommentSummary(postId, postContent) {
  console.log("Fetching summary for post:", postId);

  try {
    const token = localStorage.getItem("token");
    if (!token) {
      alert("Please login first.");
      return;
    }

    // Show loading state
    const summariesContainer = document.getElementById("summaries-container");
    if (summariesContainer) {
      summariesContainer.innerHTML =
        '<div class="loading-message">Generating summary...</div>';
    }

    const response = await fetch(`${API_URL}/posts/${postId}/summary`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    if (response.ok) {
      const data = await response.json();
      renderCommentSummary(postId, postContent, data.summary);
    } else {
      const errorData = await response.text();
      console.error("Error:", errorData);
      if (summariesContainer) {
        summariesContainer.innerHTML = `<div class="error-message">Error generating summary: ${errorData}</div>`;
      }
    }
  } catch (error) {
    console.error("Error fetching comment summary:", error);
    const summariesContainer = document.getElementById("summaries-container");
    if (summariesContainer) {
      summariesContainer.innerHTML = `<div class="error-message">Network error: ${error.message}</div>`;
    }
  }
}

// Render comment summary
function renderCommentSummary(postId, postContent, summary) {
  const summariesContainer = document.getElementById("summaries-container");
  if (!summariesContainer) return;

  const summaryCard = document.createElement("div");
  summaryCard.className = "summary-card";
  summaryCard.style.cssText = `
    background: white;
    border: 1px solid #ddd;
    border-radius: 10px;
    padding: 20px;
    margin: 15px 0;
    box-shadow: 0 2px 4px rgba(0,0,0,0.1);
  `;

  summaryCard.innerHTML = `
    <div style="display: flex; justify-content: between; align-items: center; margin-bottom: 15px;">
      <h3 style="margin: 0; color: #1877f2;">Comment Summary</h3>
      <button onclick="this.parentElement.parentElement.remove()" style="background: none; border: none; font-size: 20px; cursor: pointer; color: #666;">×</button>
    </div>
    <div style="background: #f8f9fa; padding: 15px; border-radius: 8px; border-left: 4px solid #1877f2;">
      <strong>Post:</strong> ${postContent.substring(0, 100)}${
    postContent.length > 100 ? "..." : ""
  }
    </div>
    <div style="margin-top: 15px; line-height: 1.6;">
      <strong>Summary:</strong><br>
      ${summary || "No summary available."}
    </div>
    <div style="margin-top: 15px; font-size: 12px; color: #666;">
      Generated on ${new Date().toLocaleString()}
    </div>
  `;

  summariesContainer.innerHTML = "";
  summariesContainer.appendChild(summaryCard);
}
