# PEREGRINE

PEREGRINE is an advanced social media platform with built-in sentiment analysis and comment summarization capabilities. It allows users to view, like, comment on, and share posts, while providing administrators with AI-powered insights into user engagement.

## Features

- User registration and login system
- User and admin roles with different permissions
- Post viewing, liking, commenting, and sharing
- Admin panel for post creation and management
- JWT-based authentication
- **Sentiment Analysis**: Automatically analyzes comment sentiment (positive/negative)
- **Comment Summarization**: AI-powered summarization of comments on posts

## Tech Stack

- **Frontend**: HTML, CSS, JavaScript (Vanilla)
- **Backend**: Node.js, Express.js
- **Database**: MongoDB with Mongoose
- **Authentication**: JWT (JSON Web Tokens)
- **Machine Learning**:
  - Scikit-learn for sentiment analysis
  - Google Generative AI (Gemini) for comment summarization
- **Multilingual**: Python and JavaScript integration

## Project Structure

```
PEREGRINE/
│
├── controllers/            # Route controllers
│   ├── adminController.js  # Admin-specific controllers
│   ├── authController.js   # Authentication controllers
│   └── postController.js   # Post-related controllers
│
├── db/
│   └── db.js               # Database connection setup
│
├── models/
│   ├── Post.js             # Post data model
│   └── User.js             # User data model
│
├── public/                 # Static files served by Express
│   ├── css/
│   │   ├── admin.css       # Admin panel styles
│   │   ├── auth.css        # Authentication page styles
│   │   └── main.css        # Main application styles
│   │
│   ├── js/
│   │   ├── admin.js        # Admin panel functionality
│   │   ├── auth.js         # Authentication functionality
│   │   └── main.js         # Main application functionality
│   │
│   ├── admin.html          # Admin panel page
│   ├── home.html           # Main user interface
│   └── index.html          # Login/registration page
│
├── utils/
│   ├── generateToken.js    # JWT token generation utility
│   ├── sentimentAnalysis.js # JS wrapper for sentiment analysis
│   ├── sentiment_analyzer.py # Python script for sentiment analysis
│   ├── commentSummarization.js # JS wrapper for comment summarization
│   ├── comment_summarizer.py # Python script for comment summarization
│   └── check_gemini.py    # Utility to check Gemini API configuration
│
├── ai_model/
│   ├── sentiment_model.sav # Pre-trained sentiment analysis model
│   ├── vectorizer.pkl      # Text vectorizer for sentiment analysis
│   └── summarization.py    # Text summarization utilities
│
├── server.js               # Express server setup
└── .env                    # Environment variables (not in repo)
```

## Setup Instructions

### Prerequisites

- Node.js (v14+)
- MongoDB (running locally or accessible via URI)
- Python (v3.8+)
- pip (Python package manager)

### Installation Steps

1. Clone the repository:

   ```bash
   git clone https://github.com/hyZenith/PEREGRINE.git
   cd PEREGRINE
   ```

2. Install Node.js dependencies:

   ```bash
   npm install
   ```

3. Install Python dependencies:

   ```bash
   pip install scikit-learn numpy pandas google-generativeai
   ```

4. Create a `.env` file in the root directory with the following variables:

   ```properties
   PORT=3000
   MONGO_URI
   JWT_SECRET
   ADMIN_EMAIL
   ADMIN_PASSWORD
   PYTHON_PATH
   GEMINI_API_KEY
   ```

   > Note: The Gemini API key provided may have limited quota. For development purposes, it's recommended to [obtain your own API key](https://ai.google.dev/) for unlimited testing.

5. Start the server:

   ```bash
   npm start
   ```

6. Access the application:
   - Main application: http://localhost:3000
   - Admin dashboard: http://localhost:3000/admin (login with admin credentials from .env file)

## Using the Application

### User Features

1. Register or login using the authentication page
2. Browse posts on the home page
3. Like, comment, or share posts
4. View your profile information

### Admin Features

1. Login with admin credentials
2. Create new posts
3. View all user posts and engagement metrics
4. Access sentiment analysis for comments
5. Generate comment summaries for posts

## API Endpoints

### Authentication

- `POST /register` - Register a new user
- `POST /login` - Login existing user

### Posts

- `GET /posts` - Get all posts
- `POST /posts/:id/like` - Like a post
- `POST /posts/:id/comment` - Comment on a post (includes automatic sentiment analysis)
- `POST /posts/:id/share` - Share a post
- `GET /posts/:id/summary` - Get AI-generated summary of comments

### Admin

- `POST /admin/posts` - Create a new post (admin only)

## AI Features

### Sentiment Analysis

The platform automatically analyzes the sentiment of user comments using a machine learning model trained on social media data. Comments are classified as positive, negative, or neutral and displayed with appropriate color coding in the admin dashboard.

### Comment Summarization

Administrators can generate concise summaries of all comments on a post using the "View Comment Summary" button. This feature uses:

1. **Primary Method**: Google's Generative AI (Gemini) for high-quality summaries
2. **Fallback Method**: Built-in basic summarization when API limits are reached

## Troubleshooting

### Comment Summarization Issues

- If you see "Failed to generate summary", it may be due to:
  - API quota limits (the free tier has limited requests)
  - Network connectivity issues
  - Python environment configuration

The system will automatically fall back to basic summarization in these cases.

### Python Dependencies

If you encounter errors related to Python modules:

```bash
pip install scikit-learn numpy pandas google-generativeai
```

### MongoDB Connection

Ensure MongoDB is running locally:

```bash
# Windows
net start MongoDB

# Linux/Mac
sudo systemctl start mongod
```
