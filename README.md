# TrendWise AI

TrendWise AI is a comprehensive full-stack application that leverages advanced Natural Language Processing (NLP) models to analyze trends, detect sentiment, and classify topics from text inputs. The repository consists of a React frontend, a Node.js intermediary backend, and a high-performance Python ML engine.

## 🚀 Features

*   **Real-time AI Sentiment & Topic Analysis**: Processes text using `DistilBert` to quickly identify the overarching sentiment and topic categorization.
*   **VectorDB Powered Retrieval Augmented Generation (RAG)**: Employs ChromaDB to retrieve relevant historical archives and cross-references data with real-time news and Reddit discussions.
*   **Dual-Backend Architecture**: Utilizes a Node.js Express server to handle API routing and a Python FastAPI GPU-accelerated engine to perform heavy ML compute tasks.

## 📁 Project Structure

*   `frontend/`: A React + Vite Web Application for the user interface.
*   `backend/node-backend/`: An Express server that manages API requests.
*   `backend/python-backend/`: A FastAPI backend running PyTorch models, Sentence Transformers, and a Vector Database.

---

## ⚙️ Installation

The system provides automated scripts to set up the environment on both Windows and Linux/macOS.

### Prerequisites

Ensure you have the following installed on your machine:
*   [Node.js](https://nodejs.org/) (v16 or higher)
*   [Python](https://www.python.org/downloads/) (3.8 or higher)
*   [Git](https://git-scm.com/downloads)

### 🔑 1. Configure API Keys

Before starting the installation, you must provide your own API keys for the Python backend to fetch web and news data, and synthesize final responses.

1.  Open the file `backend/python-backend/app.py`.
2.  Locate lines `36` and `37`:
    ```python
    NEWS_API_KEY    = "ADD_NEWS_API_KEY_HERE"
    GOOGLE_API_KEY  = "ADD_GOOGLE_API_KEY_HERE"
    ```
3.  Replace the placeholder values with your actual API keys:
    *   **NewsAPI Key**: Register at [NewsAPI.org](https://newsapi.org/)
    *   **Google Gemini API Key**: Generate one from [Google AI Studio](https://aistudio.google.com/)

### 📦 2. Install Dependencies & Download Models

The installation script will automatically create a Python virtual environment, install PIP and NPM dependencies, and download the necessary AI models (~1.4GB) from HuggingFace.

#### On Windows:
Double-click `install.bat` from the root directory or run it in your command prompt:
```bat
.\install.bat
```

#### On Linux / macOS:
Open a terminal in the root directory and run the shell script:
```bash
./install.sh
```

*(Note: The model download process may take several minutes depending on your internet connection speed).*

---

## 🏃 Running the Application

Once installation is fully complete, you can launch all three services (Frontend, Node API, Python ML Engine) concurrently using the automated startup scripts.

#### On Windows:
Double-click `start.bat` from the root directory or run it in your command prompt:
```bat
.\start.bat
```
*(This will open three new Command Prompt windows for each service. Close these windows to terminate the system).*

#### On Linux / macOS:
Make the script executable (only needed once), then run it:
```bash
chmod +x start.sh
./start.sh
```
*(The scripts will run in the background within the SAME terminal. Press `Ctrl+C` to gracefully terminate all 3 services at once).*

---

## 📡 Endpoints & Ports
By default, the services will run on the following local ports:
*   **Frontend**: `http://localhost:5173` (Vite Default)
*   **Node Backend**: `http://localhost:5000`
*   **Python Engine**: `http://localhost:8000`
