# Real-Time Voice Sentiment Visualization

A full-stack web application that performs real-time audio transcription and visualizes the speaker's emotional sentiment through a beautiful, dynamic Perlin noise field.

Try it out here: https://voice-agent-ruddy.vercel.app/

## 🎨 Features

- **Real-time Audio Transcription**: Uses Deepgram API for high-accuracy speech-to-text
- **AI-Powered Sentiment Analysis**: Leverages OpenAI GPT-4 or Anthropic Claude to extract sentiment, emotion, and keywords
- **Dynamic Perlin Noise Visualization**: Gorgeous generative art that responds to emotional data
  - Color shifts based on sentiment type (joy, calm, anxiety, anger, etc.)
  - Particle energy reflects emotional intensity
  - Flow field dynamics respond to energy levels
- **Smooth Animations**: Keywords fade in gracefully, transcripts auto-scroll
- **Modern UI**: Clean, semi-transparent overlays with glassmorphism effects

## 🏗️ Architecture

This is a three-part system:

1. **Frontend (React)**: Captures audio, manages WebSocket connections, displays UI and visualization
2. **Backend (FastAPI)**: Proxy server that securely calls AI APIs for sentiment analysis
3. **External APIs**: 
   - Deepgram for real-time transcription
   - OpenAI/Claude for sentiment and keyword extraction

## 📋 Prerequisites

- Node.js (v16 or higher)
- Python 3.8+
- Deepgram API Key ($200 credits available)
- OpenAI API Key or Anthropic API Key

## 🚀 Setup Instructions

### 1. Backend Setup

```bash
cd backend

# Create virtual environment
python3 -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate

# Install dependencies
pip install -r requirements.txt

# Set up environment variables
# Create a .env file in the backend directory:
echo "OPENAI_API_KEY=your_key_here" > .env
# OR
echo "ANTHROPIC_API_KEY=your_key_here" > .env

# Run the server
python main.py
```

The backend will be available at `http://localhost:8000`

### 2. Frontend Setup

```bash
cd voice-agent

# Install dependencies
npm install

# Set up environment variables
# Create a .env file in the voice-agent directory:
echo "REACT_APP_DEEPGRAM_API_KEY=your_key_here" > .env
echo "REACT_APP_API_URL=http://localhost:8000" >> .env

# Start the development server
npm start
```

The app will open at `http://localhost:3000`

## 🎮 Usage

1. Click **"Start Recording"** to begin capturing audio
2. Speak naturally - your words will appear in the transcript panel
3. Watch the visualization respond to your emotional tone
4. Keywords will fade in smoothly on the right panel
5. Click **"Stop Recording"** when finished

## 🎨 Visualization Details

The Perlin noise visualization maps sentiment data to visual parameters:

- **Color (Hue)**:
  - Joyful/Happy: Yellow-orange (45°)
  - Calm/Peaceful: Blue (200°)
  - Anxious/Nervous: Purple (280°)
  - Angry: Red (0°)
  - Sad: Deep blue (220°)
  - Surprised: Cyan (160°)
  - Loving: Pink (330°)

- **Saturation**: Increases with emotion intensity
- **Brightness**: Higher for more intense emotions
- **Particle Speed**: Scales with energy level (calm → energetic)
- **Flow Field Complexity**: More turbulent for higher energy

## 📁 Project Structure

```
voice-agent/
├── src/
│   ├── components/
│   │   ├── PerlinVisualization.js    # P5.js Perlin noise field
│   │   ├── TranscriptDisplay.js       # Live transcript panel
│   │   ├── KeywordsDisplay.js         # Animated keywords
│   │   └── Controls.js                # Start/Stop buttons
│   ├── hooks/
│   │   └── useDeepgram.js             # Deepgram WebSocket management
│   ├── services/
│   │   └── sentimentService.js        # Backend API calls
│   ├── App.js                         # Main application
│   └── index.js                       # Entry point
├── public/
└── package.json

backend/
├── main.py                            # FastAPI server
├── requirements.txt                   # Python dependencies
└── .env                               # API keys (create this)
```

## 🔧 Configuration

### Backend API Model Selection

By default, the app uses OpenAI GPT-4. To switch to Claude:

1. Update `sentimentService.js` to call `/process_text_claude`
2. Set `ANTHROPIC_API_KEY` in backend `.env`

### Visualization Tuning

Adjust parameters in `PerlinVisualization.js`:
- `particlesRef.current`: Number of particles (default: 500)
- Flow field resolution: `cols` and `rows` (default: 20px grid)
- Color transition speed: `0.05` in the lerp calculation
- Trail effect: Alpha value in background rect

## 🐛 Troubleshooting

**Microphone not working:**
- Ensure HTTPS or localhost (mic requires secure context)
- Check browser permissions for microphone access

**Backend connection failed:**
- Verify backend is running on port 8000
- Check CORS settings in `main.py`
- Ensure `.env` variables are set correctly

**Deepgram errors:**
- Verify API key is valid and has credits
- Check internet connection for WebSocket

**No visualization:**
- Open browser console for errors
- Ensure `react-p5` and `p5` are installed

## 🎯 Assessment Criteria

This project demonstrates:

✅ **Full-Stack Orchestration**: Frontend, backend, and two external APIs working in harmony  
✅ **Data-Driven Visualization**: Sentiment mapped to color, motion, and intensity  
✅ **Frontend Polish**: Smooth transitions, fade-in animations, glassmorphism  
✅ **Async Management**: Debouncing, error handling, loading states  
✅ **Real-time Performance**: WebSocket streaming, responsive updates  

## 📚 Technologies Used

- **Frontend**: React, react-p5, p5.js, Deepgram SDK, Axios
- **Backend**: FastAPI, OpenAI/Anthropic SDK, Uvicorn
- **APIs**: Deepgram (transcription), OpenAI GPT-4 / Claude (sentiment)
- **Styling**: CSS3 with glassmorphism, animations, gradients

## 🌟 Future Enhancements

- [ ] Multi-language support
- [ ] Export transcript and sentiment timeline
- [ ] 3D visualization with Three.js
- [ ] Voice emotion training mode
- [ ] Real-time sentiment graph overlay
- [ ] Multiple speaker detection

## 📄 License

This project is built as a technical demonstration for Memory Machines.

---

**Built with ❤️ for Memory Machines - Going Beyond LLMs**
