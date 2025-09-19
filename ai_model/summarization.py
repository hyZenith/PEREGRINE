# Text Summarization Using Gemini (Google Generative AI)

import google.generativeai as genai

# Set Gemini API key
genai.configure(api_key="AIzaSyAowCOjjK0L2hFR31sE5ZJttuq_m0uKFxs")

# Example Speech to be Summarized
speech = """
People across the country, involved in government, political, and social activities, are dedicating their time to make the ‘Viksit Bharat Sankalp Yatra’ (Developed India Resolution Journey) successful. Therefore, as a Member of Parliament, it was my responsibility to also contribute my time to this program. So, today, I have come here just as a Member of Parliament and your ‘sevak’, ready to participate in this program, much like you.

In our country, governments have come and gone, numerous schemes have been formulated, discussions have taken place, and big promises have been made. However, my experience and observations led me to believe that the most critical aspect that requires attention is ensuring that the government’s plans reach the intended beneficiaries without any hassles. If there is a ‘Pradhan Mantri Awas Yojana’ (Prime Minister’s housing scheme), then those who are living in jhuggis and slums should get their houses. And he should not need to make rounds of the government offices for this purpose. The government should reach him. Since you have assigned this responsibility to me, about four crore families have got their ‘pucca’ houses. However, I have encountered cases where someone is left out of the government benefits. Therefore, I have decided to tour the country again, to listen to people’s experiences with government schemes, to understand whether they received the intended benefits, and to ensure that the programs are reaching everyone as planned without paying any bribes. We will get the real picture if we visit them again. Therefore, this ‘Viksit Bharat Sankalp Yatra’ is, in a way, my own examination. I want to hear from you and the people across the country whether what I envisioned and the work I have been doing aligns with reality and whether it has reached those for whom it was meant.
"""

# Create the prompt for summarization
prompt = f"Summarize the following speech in 1-2 sentences, using as few words as possible (max 20 words):\n\n{speech}"

# Use Gemini to generate the summary
model = genai.GenerativeModel(model_name="models/gemini-1.5-pro")
response = model.generate_content(prompt)

print(response.text)