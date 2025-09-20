#!/usr/bin/env python3
"""
Utility script to check if the Google Generative AI (Gemini) API is working correctly
"""

import sys
import os

try:
    import google.generativeai as genai
    print("✓ Google Generative AI module is installed correctly")
except ImportError as e:
    print(f"✗ Error importing Google Generative AI module: {e}")
    print("  Please install it using: pip install google-generativeai")
    sys.exit(1)

# Get API key from environment variable or use default
api_key = os.environ.get("GEMINI_API_KEY", "AIzaSyAowCOjjK0L2hFR31sE5ZJttuq_m0uKFxs")

try:
    # Configure Gemini with the API key
    genai.configure(api_key=api_key)
    print(f"✓ Configured Gemini API with key: {api_key[:5]}...{api_key[-4:]}")
    
    # List available models to verify API key works
    try:
        models = genai.list_models()
        text_models = [m.name for m in models if "generateContent" in m.supported_generation_methods]
        print(f"✓ API key is valid. Available text models: {', '.join(text_models)}")
    except Exception as e:
        print(f"✗ Error listing models: {e}")
        print("  This usually indicates an invalid API key")
        sys.exit(1)
        
    # Try a simple generation task
    try:
        model = genai.GenerativeModel(model_name="models/gemini-1.5-pro")
        response = model.generate_content("Say 'Hello, world!'")
        print(f"✓ Test generation successful: {response.text}")
    except Exception as e:
        print(f"✗ Error generating content: {e}")
        sys.exit(1)
        
    print("\nGemini API is configured correctly and working! ✓")
    
except Exception as e:
    print(f"✗ Unexpected error: {e}")
    sys.exit(1)