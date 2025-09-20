#!/usr/bin/env python3
import sys
import pickle
import os

def load_model_and_vectorizer():
    # Get the current directory
    base_path = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
    model_path = os.path.join(base_path, 'ai_model', 'sentiment_model.sav')
    vectorizer_path = os.path.join(base_path, 'ai_model', 'vectorizer.pkl')
    
    # Load the model and vectorizer
    try:
        with open(model_path, 'rb') as f:
            model = pickle.load(f)
        
        with open(vectorizer_path, 'rb') as f:
            vectorizer = pickle.load(f)
            
        return model, vectorizer
    except Exception as e:
        print(f"Error loading model: {str(e)}", file=sys.stderr)
        sys.exit(1)

def analyze_sentiment(text):
    try:
        # Load the model and vectorizer
        model, vectorizer = load_model_and_vectorizer()
        
        # Transform the text using the vectorizer
        text_vectorized = vectorizer.transform([text])
        
        # Predict sentiment
        sentiment_prediction = model.predict(text_vectorized)[0]
        
        # Map numerical prediction to sentiment label
        if sentiment_prediction == 1:
            return "positive"
        else:
            return "negative"
    except Exception as e:
        print(f"Error analyzing sentiment: {str(e)}", file=sys.stderr)
        sys.exit(1)

if __name__ == "__main__":
    if len(sys.argv) < 2:
        print("Usage: python sentiment_analyzer.py <file_path>", file=sys.stderr)
        sys.exit(1)
        
    file_path = sys.argv[1]
    
    try:
        with open(file_path, 'r', encoding='utf-8') as file:
            text = file.read().strip()
            
        sentiment = analyze_sentiment(text)
        print(sentiment)
        sys.exit(0)
    except Exception as e:
        print(f"Error: {str(e)}", file=sys.stderr)
        sys.exit(1)