from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
import os
from dotenv import load_dotenv
from openai import OpenAI
from anthropic import Anthropic
import json

# Load environment variables from .env file
load_dotenv()

app = FastAPI()

# CORS configuration for React frontend
# Get allowed origins from environment variable (comma-separated)
allowed_origins = os.getenv("ALLOWED_ORIGINS", "http://localhost:3000").split(",")

app.add_middleware(
    CORSMiddleware,
    allow_origins=allowed_origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Initialize AI clients (you can choose which one to use)
# Set your API keys as environment variables
openai_api_key = os.getenv("OPENAI_API_KEY")
if not openai_api_key:
    raise ValueError(
        "OPENAI_API_KEY not found. Please create a .env file in the backend directory "
        "and add: OPENAI_API_KEY=your_api_key_here"
    )

openai_client = OpenAI(api_key=openai_api_key)


class TextInput(BaseModel):
    text: str


class SentimentResponse(BaseModel):
    sentiment: float  # -1.0 to 1.0 (negative to positive)
    sentiment_label: str  # e.g., "joyful", "anxious", "calm", "excited"
    keywords: list[str]
    emotion_intensity: float  # 0.0 to 1.0
    energy_level: float  # 0.0 to 1.0 (calm to energetic)


@app.get("/")
async def root():
    return {"message": "Sentiment Analysis API is running"}


@app.post("/process_text", response_model=SentimentResponse)
async def process_text(input_data: TextInput):
    """
    Process text through AI model to extract sentiment and keywords.
    Returns structured data for visualization.
    """
    try:
        text = input_data.text.strip()
        
        if not text:
            raise HTTPException(status_code=400, detail="Text cannot be empty")
        
        # Construct the prompt for the AI model
        system_prompt = """You are an expert sentiment analyzer. Analyze the given text and return a JSON object with:
- sentiment: a float from -1.0 (very negative) to 1.0 (very positive)
- sentiment_label: a single descriptive word for the emotion (e.g., "joyful", "anxious", "calm", "excited", "melancholic", "angry", "peaceful")
- keywords: an array of 3-5 key words or short phrases from the text
- emotion_intensity: a float from 0.0 (very subdued) to 1.0 (very intense)
- energy_level: a float from 0.0 (very calm/low energy) to 1.0 (very energetic/high energy)

Be nuanced in your analysis. Return ONLY the JSON object, no other text."""

        user_prompt = f"Analyze this text:\n\n{text}"
        
        response = openai_client.chat.completions.create(
            model="gpt-4-turbo-preview",
            messages=[
                {"role": "system", "content": system_prompt},
                {"role": "user", "content": user_prompt}
            ],
            temperature=0.3,
            response_format={"type": "json_object"}
        )
        
        # Parse the response
        result = json.loads(response.choices[0].message.content)
        
        # Validate and return
        return SentimentResponse(**result)
        
    except json.JSONDecodeError as e:
        raise HTTPException(status_code=500, detail=f"Failed to parse AI response: {str(e)}")
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error processing text: {str(e)}")


if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)

