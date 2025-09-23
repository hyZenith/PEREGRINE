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

    // Fill post title if exists
    const titleElement = postElement.querySelector(".post-title");
    if (post.title && post.title.trim()) {
      titleElement.textContent = post.title;
      titleElement.style.display = "block";
    }

    // Fill post content
    postElement.querySelector(".post-content p").textContent = post.content;
    postElement.querySelector(".post-date .date").textContent = formatDate(
      post.createdAt
    );

    // Render attachments if they exist
    const attachmentsElement = postElement.querySelector(".post-attachments");
    if (post.attachments && post.attachments.length > 0) {
      attachmentsElement.innerHTML = renderAttachments(post.attachments);
      attachmentsElement.style.display = "block";
    }

    // Render embed link if exists
    const embedLinkElement = postElement.querySelector(".embed-link");
    if (post.embedLink && post.embedLink.trim()) {
      embedLinkElement.innerHTML = `<a href="${post.embedLink}" target="_blank">${post.embedLink}</a>`;
      embedLinkElement.style.display = "block";
    }

    // Set likes count
    postElement.querySelector(".like-count").textContent = post.likes || 0;
    const likeBtn = postElement.querySelector(".like-btn");
const userId = localStorage.getItem("userId"); // get current user ID
if (post.likedBy && post.likedBy.includes(userId)) {
  likeBtn.classList.add("liked");
  likeBtn.style.color = "lightblue";
}

    //set comments count
    postElement.querySelector(".comment-count").textContent =
    (post.comments && post.comments.length) || 0;
    //set shares count
    postElement.querySelector(".share-count").textContent = post.shares || 0;


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
  // shareBtn.addEventListener("click", () => handleShare(postId));
  shareBtn.addEventListener("click", () => handleShare(postId, shareBtn));


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
// async function handleLike(postId, likeBtn) {
//   try {
//     const token = localStorage.getItem("token");
//     if (!token) return;

//     const response = await fetch(`${API_URL}/posts/${postId}/like`, {
//       method: "POST",
//       headers: {
//         Authorization: `Bearer ${token}`,
//         "Content-Type": "application/json",
//       },
//     });

//     if (response.ok) {
//       // Update like count in UI
//       const likeCount = likeBtn.querySelector(".like-count");
//       likeCount.textContent = parseInt(likeCount.textContent) + 1;

//       // Visual feedback
//       likeBtn.classList.add("active");
//       setTimeout(() => {
//         likeBtn.classList.remove("active");
//       }, 1000);
//     }
//   } catch (error) {
//     console.error("Error liking post:", error);
//   }
// }
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

    if (!response.ok) {
      console.error("Failed to toggle like");
      return;
    }

    const data = await response.json();
    const postElement = likeBtn.closest(".post");
    const likeCountElement = postElement.querySelector(".like-count");

    // Update UI
    likeCountElement.textContent = data.likes;
    if (data.liked) {
      likeBtn.classList.add("liked");
      likeBtn.style.color = "lightblue";
    } else {
      likeBtn.classList.remove("liked");
      likeBtn.style.color = "";
    }
  } catch (error) {
    console.error("Error toggling like:", error);
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

  // ✅ Update comment count
  const postElement = commentsListElement.closest(".post");
  const commentCountElement = postElement.querySelector(".comment-count");
  commentCountElement.textContent =
    parseInt(commentCountElement.textContent) + 1;

  // Clear input
  commentInput.value = "";
}

  } catch (error) {
    console.error("Error posting comment:", error);
  }
}

// Handle share action
// async function handleShare(postId) {
//   try {
//     const token = localStorage.getItem("token");
//     if (!token) return;

//     const response = await fetch(`${API_URL}/posts/${postId}/share`, {
//       method: "POST",
//       headers: {
//         Authorization: `Bearer ${token}`,
//         "Content-Type": "application/json",
//       },
//     });

//     if (response.ok) {
//       alert("Post shared successfully!");
//     }
//   } catch (error) {
//     console.error("Error sharing post:", error);
//   }
// }
// Handle share action
function handleShare(postId, shareBtn) {
  const postElement = shareBtn.closest(".post");
  const shareCountElement = postElement.querySelector(".share-count");

  // Remove existing menu if already open
  const existingMenu = postElement.querySelector(".share-menu");
  if (existingMenu) {
    existingMenu.remove();
    return;
  }

  // Create share menu
  const menu = document.createElement("div");
  menu.className = "share-menu";
  menu.innerHTML = `
    <a href="https://www.facebook.com/sharer/sharer.php?u=${window.location.href}" target="_blank"><i class="fab fa-facebook"></i></a>
    <a href="https://www.instagram.com/" target="_blank"><i class="fab fa-instagram"></i></a>
    <a href="https://wa.me/?text=${encodeURIComponent(window.location.href)}" target="_blank"><i class="fab fa-whatsapp"></i></a>
    <a href="https://www.youtube.com/" target="_blank"><i class="fab fa-youtube"></i></a>
    <a href="https://discord.com/" target="_blank"><i class="fab fa-discord"></i></a>
    <a href="https://twitter.com/intent/tweet?url=${encodeURIComponent(window.location.href)}" target="_blank"><i class="fab fa-twitter"></i></a>
  `;

  // Style (inline or move to CSS file)
  menu.style.display = "flex";
  menu.style.gap = "10px";
  menu.style.marginTop = "8px";
  menu.style.fontSize = "20px";

  // Append below share button
  shareBtn.parentElement.appendChild(menu);

  // When any share option is clicked -> update backend + UI
  menu.querySelectorAll("a").forEach(link => {
    link.addEventListener("click", async () => {
      try {
        const token = localStorage.getItem("token");
        if (!token) return;

        // Call backend to increment share count
        const response = await fetch(`${API_URL}/posts/${postId}/share`, {
          method: "POST",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        });

        if (response.ok) {
          let currentShares = parseInt(shareCountElement.textContent) || 0;
          shareCountElement.textContent = currentShares + 1;
        } else {
          console.error("Failed to update share count");
        }
      } catch (error) {
        console.error("Error sharing post:", error);
      }

      // ✅ Close menu after sharing
      setTimeout(() => {
        menu.remove();
      }, 300);
    });
  });
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

// Render attachments function
function renderAttachments(attachments) {
  if (!attachments || attachments.length === 0) return "";

  let html = "";
  attachments.forEach((attachment) => {
    if (attachment.mimetype.startsWith("image/")) {
      html += `<div class="attachment-item">
        <img src="uploads/${attachment.filename}" alt="${attachment.originalname}" class="attachment-image" style="max-width: 100%; height: auto; border-radius: 8px; margin: 10px 0;" />
      </div>`;
    } else if (attachment.mimetype === "application/pdf") {
      html += `<div class="attachment-item">
        <a href="uploads/${attachment.filename}" target="_blank" class="attachment-pdf" style="display: inline-block; padding: 10px; background-color: #f0f0f0; border-radius: 5px; text-decoration: none; color: #333; margin: 5px 0;">
          <i class="fas fa-file-pdf" style="color: #d32f2f;"></i> ${attachment.originalname}
        </a>
      </div>`;
    }
  });
  return html;
}

// Run on page load
checkAuthStatus();
loadPosts();
