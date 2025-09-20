#!/usr/bin/env python3
import sys
import json
import google.generativeai as genai
import os

def fallback_summarize(comments):
    """
    A fallback summarization method that doesn't rely on external APIs
    
    Args:
        comments: A list of comment strings
        
    Returns:
        A summarized string
    """
    # If no comments, return appropriate message
    if not comments:
        return "No comments to summarize."
    
    # Count total comments
    comment_count = len(comments)
    
    # Get average comment length
    total_length = sum(len(c) for c in comments)
    avg_length = total_length / comment_count if comment_count > 0 else 0
    
    # Count sentiments if available (assuming comments might have sentiment analysis)
    positive_count = sum(1 for c in comments if "great" in c.lower() or "good" in c.lower() or "like" in c.lower() or "love" in c.lower())
    negative_count = sum(1 for c in comments if "bad" in c.lower() or "poor" in c.lower() or "hate" in c.lower() or "dislike" in c.lower())
    
    # Determine overall sentiment
    if positive_count > negative_count:
        sentiment = "mostly positive"
    elif negative_count > positive_count:
        sentiment = "mostly negative"
    else:
        sentiment = "mixed or neutral"
    
    # Generate summary
    if comment_count == 1:
        summary = f"There is 1 comment with {sentiment} sentiment."
    else:
        summary = f"There are {comment_count} comments with {sentiment} sentiment. "
        
    # Add more context if we have enough comments
    if comment_count >= 3:
        summary += f"Comments have an average length of {int(avg_length)} characters."
    
    return summary

def summarize_comments(comments):
    """
    Summarize a list of comments using Google Generative AI (Gemini)
    or fallback to basic summarization if API fails
    
    Args:
        comments: A list of comment strings
    
    Returns:
        A summarized string
    """
    try:
        # Get API key from environment variable or use the one in the original file
        api_key = os.environ.get("GEMINI_API_KEY", "AIzaSyAowCOjjK0L2hFR31sE5ZJttuq_m0uKFxs")
        
        # Configure Gemini
        genai.configure(api_key=api_key)
        
        # Combine all comments into one text
        all_comments = "\n\n".join(comments)
        
        # Create the prompt for summarization
        prompt = f"Summarize the following comments in 2-3 sentences, capturing the main sentiment and key points:\n\n{all_comments}"
        
        # Use Gemini to generate the summary
        model = genai.GenerativeModel(model_name="models/gemini-1.5-pro")
        response = model.generate_content(prompt)
        
        # Return the summary
        return response.text.strip()
    except Exception as e:
        # Log the error
        print(f"Error in Gemini summarization: {str(e)}", file=sys.stderr)
        print("Falling back to basic summarization", file=sys.stderr)
        
        # Use fallback summarization method
        return fallback_summarize(comments)
    except Exception as e:
        error_message = str(e)
        print(f"Error in summarization: {error_message}", file=sys.stderr)
        
        # More specific error messages for common issues
        if "API key" in error_message.lower() or "authentication" in error_message.lower():
            print("API key error detected, using fallback", file=sys.stderr)
            return fallback_summarize(comments)
        elif "quota" in error_message.lower() or "limit" in error_message.lower():
            print("API quota limit reached, using fallback", file=sys.stderr)
            return fallback_summarize(comments)
        elif "model" in error_message.lower():
            print("Model error detected, using fallback", file=sys.stderr)
            return fallback_summarize(comments)
        elif "network" in error_message.lower() or "connect" in error_message.lower():
            print("Network error detected, using fallback", file=sys.stderr)
            return fallback_summarize(comments)
        else:
            print(f"Unknown error, using fallback: {error_message[:100]}...", file=sys.stderr)
            return fallback_summarize(comments)

if __name__ == "__main__":
    if len(sys.argv) < 2:
        print("Usage: python comment_summarizer.py <comments_json_file>", file=sys.stderr)
        sys.exit(1)
    
    file_path = sys.argv[1]
    
    try:
        with open(file_path, 'r', encoding='utf-8') as file:
            comments_data = json.load(file)
            
        # Check if there are any comments to summarize
        if not comments_data or len(comments_data) == 0:
            print("No comments to summarize.")
            sys.exit(0)
            
        # Filter out empty comments
        valid_comments = [comment for comment in comments_data if comment and isinstance(comment, str) and comment.strip()]
        
        if not valid_comments:
            print("No valid comments to summarize.")
            sys.exit(0)
        if not isinstance(comments_data, list):
            print("Error: Input JSON must be an array of comment strings", file=sys.stderr)
            sys.exit(1)
            
        summary = summarize_comments(comments_data)
        print(summary)
        sys.exit(0)
    except Exception as e:
        print(f"Error: {str(e)}", file=sys.stderr)
        sys.exit(1)