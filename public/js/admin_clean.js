// Constants
const API_URL = "http://localhost:3000";

// DOM Elements
const userNameElement = document.getElementById("user-name");
const logoutBtn = document.getElementById("logout-btn");
const postsContainer = document.getElementById("posts-container");
const commentsContainer = document.getElementById("comments-container");
const summariesContainer = document.getElementById("summaries-container");
const positiveCountElement = document.getElementById("positive-count");
const negativeCountElement = document.getElementById("negative-count");
const neutralCountElement = document.getElementById("neutral-count");

// File handling
let selectedFiles = [];

// Sentiment chart
let sentimentChart = null;

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
    renderPosts(posts);
    renderCommentSentiments(posts);
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
        <button class="view-comments-btn" onclick="showPostComments('${
          post._id
        }')">View Comments</button>
        <button class="generate-summary-btn" onclick="fetchCommentSummary('${
          post._id
        }', '${post.content.replace(/'/g, "\\'")}')">Generate Summary</button>
        <button class="delete-post-btn" onclick="showDeleteConfirmation('${
          post._id
        }')">Delete Post</button>
      </div>
    `;
    postsContainer.appendChild(postElement);
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

// Render comment sentiments (placeholder for now)
function renderCommentSentiments(posts) {
  // Implementation for sentiment analysis display
  console.log("Rendering comment sentiments for", posts.length, "posts");
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
function showPostComments(postId) {
  console.log("Showing comments for post:", postId);
  // Implementation for showing comments
}

async function fetchCommentSummary(postId, postContent) {
  console.log("Fetching summary for post:", postId);
  // Implementation for fetching comment summary
}
