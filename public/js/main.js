// Constants
const API_URL = "http://localhost:3000";

// DOM Elements
const postsContainer = document.getElementById("posts-container");
const userNameElement = document.getElementById("user-name");
const logoutBtn = document.getElementById("logout-btn");
const adminLink = document.getElementById("admin-link");

// Check if user is logged in
function checkAuthStatus() {
  const token = localStorage.getItem("token");
  if (!token) {
    // Redirect to login page if not logged in
    window.location.href = "index.html";
    return;
  }

  // Update user name display
  const userName = localStorage.getItem("userName");
  if (userName) {
    userNameElement.textContent = userName;
  }

  // Show admin link if user is admin
  const isAdmin = localStorage.getItem("isAdmin") === "true";
  if (isAdmin) {
    adminLink.style.display = "inline-block";
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
    const template = document.getElementById("post-template");
    const postElement = document.importNode(template.content, true);

    // Fill post content
    postElement.querySelector(".post-content p").textContent = post.content;
    postElement.querySelector(".post-date .date").textContent = formatDate(
      post.createdAt
    );

    // Set likes count
    postElement.querySelector(".like-count").textContent = post.likes || 0;

    // Store post ID as data attribute
    const postDiv = postElement.querySelector(".post");
    postDiv.dataset.postId = post._id;

    // Add event listeners for interactions
    addPostEventListeners(postElement, post);

    // Add comments if any
    const commentsList = postElement.querySelector(".comments-list");
    if (post.comments && post.comments.length > 0) {
      renderComments(commentsList, post.comments);
    } else {
      commentsList.innerHTML =
        '<div class="no-comments">No comments yet.</div>';
    }

    postsContainer.appendChild(postElement);
  });
}

// Add event listeners for post interactions
function addPostEventListeners(postElement, post) {
  const postId = post._id;
  const likeBtn = postElement.querySelector(".like-btn");
  const commentBtn = postElement.querySelector(".comment-btn");
  const shareBtn = postElement.querySelector(".share-btn");
  const commentsSection = postElement.querySelector(".comments-section");
  const postCommentBtn = postElement.querySelector(".post-comment-btn");
  const commentInput = postElement.querySelector(".comment-input");

  // Like button
  likeBtn.addEventListener("click", () => handleLike(postId, likeBtn));

  // Comment button - toggle comment section
  commentBtn.addEventListener("click", () => {
    commentsSection.style.display =
      commentsSection.style.display === "none" ? "block" : "none";
  });

  // Share button
  shareBtn.addEventListener("click", () => handleShare(postId));

  // Post comment
  postCommentBtn.addEventListener("click", () => {
    const comment = commentInput.value.trim();
    if (comment) {
      handleComment(
        postId,
        comment,
        commentsSection.querySelector(".comments-list"),
        commentInput
      );
    }
  });

  // Enter key for comment
  commentInput.addEventListener("keypress", (e) => {
    if (e.key === "Enter") {
      const comment = commentInput.value.trim();
      if (comment) {
        handleComment(
          postId,
          comment,
          commentsSection.querySelector(".comments-list"),
          commentInput
        );
      }
    }
  });
}

// Handle like action
async function handleLike(postId, likeBtn) {
  try {
    const token = localStorage.getItem("token");
    if (!token) return;

    const response = await fetch(`${API_URL}/posts/${postId}/like`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
    });

    if (response.ok) {
      // Update like count in UI
      const likeCount = likeBtn.querySelector(".like-count");
      likeCount.textContent = parseInt(likeCount.textContent) + 1;

      // Visual feedback
      likeBtn.classList.add("active");
      setTimeout(() => {
        likeBtn.classList.remove("active");
      }, 1000);
    }
  } catch (error) {
    console.error("Error liking post:", error);
  }
}

// Handle comment action
async function handleComment(
  postId,
  comment,
  commentsListElement,
  commentInput
) {
  try {
    const token = localStorage.getItem("token");
    if (!token) return;

    const userName = localStorage.getItem("userName") || "Anonymous";

    const response = await fetch(`${API_URL}/posts/${postId}/comment`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        username: userName,
        comment: comment,
      }),
    });

    if (response.ok) {
      // Clear no comments message if it exists
      const noComments = commentsListElement.querySelector(".no-comments");
      if (noComments) {
        commentsListElement.innerHTML = "";
      }

      // Add new comment to the UI
      const template = document.getElementById("comment-template");
      const commentElement = document.importNode(template.content, true);

      commentElement.querySelector(".comment-user").textContent = userName;
      commentElement.querySelector(".comment-text").textContent = comment;
      commentElement.querySelector(".comment-date").textContent = "Just now";

      commentsListElement.appendChild(commentElement);

      // Clear input
      commentInput.value = "";
    }
  } catch (error) {
    console.error("Error posting comment:", error);
  }
}

// Handle share action
async function handleShare(postId) {
  try {
    const token = localStorage.getItem("token");
    if (!token) return;

    const response = await fetch(`${API_URL}/posts/${postId}/share`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
    });

    if (response.ok) {
      alert("Post shared successfully!");
    }
  } catch (error) {
    console.error("Error sharing post:", error);
  }
}

// Render comments
function renderComments(commentsListElement, comments) {
  commentsListElement.innerHTML = "";

  comments.forEach((comment) => {
    const template = document.getElementById("comment-template");
    const commentElement = document.importNode(template.content, true);

    commentElement.querySelector(".comment-user").textContent =
      comment.username;
    commentElement.querySelector(".comment-text").textContent = comment.comment;
    commentElement.querySelector(".comment-date").textContent = formatDate(
      comment.timestamp
    );

    commentsListElement.appendChild(commentElement);
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

// Run on page load
checkAuthStatus();
loadPosts();
