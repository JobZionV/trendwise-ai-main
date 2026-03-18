"""
TrendWise AI — FastAPI Compute Engine (GPU)
Run: uvicorn app:app --host 0.0.0.0 --port 8000 --reload
"""

import torch, torch.nn as nn
import json, os, re, uuid, requests
import chromadb, emoji, nltk

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel

# ── NLP / ML Imports ─────────────────────────────────────────
from nltk.stem import WordNetLemmatizer
from nltk.corpus import stopwords
from sentence_transformers import SentenceTransformer, CrossEncoder
from transformers import AutoTokenizer, DistilBertForSequenceClassification, DistilBertModel
from ddgs import DDGS
from langchain_google_genai import ChatGoogleGenerativeAI
from langchain_core.prompts import ChatPromptTemplate
from langchain_core.output_parsers import StrOutputParser
import spacy


# ============================================================
# CONFIG
# ============================================================
BASE_DIR = os.path.dirname(os.path.abspath(__file__))
MODELS_DIR = os.path.join(BASE_DIR, "models")

SENTIMENT_PATH  = os.path.join(MODELS_DIR, "trendwise_sentiment_final")
TOPIC_PATH      = os.path.join(MODELS_DIR, "trendwise_topic_model.pth")
DB_PATH         = os.path.join(MODELS_DIR, "vectorDB_Final")

NEWS_API_KEY    = "ADD_NEWS_API_KEY_HERE"
GOOGLE_API_KEY  = "ADD_GOOGLE_API_KEY_HERE"

os.environ["GOOGLE_API_KEY"] = GOOGLE_API_KEY

# Set the number of threads for OpenBLAS/MKL/HNSW
os.environ["OMP_NUM_THREADS"] = "16"

# ============================================================
# STARTUP — load models once onto GPU
# ============================================================
print("⚙️  Booting TrendWise AI ML Engine...")
device = torch.device("cuda" if torch.cuda.is_available() else "cpu")
print(f"   Device Selected: {device}")

# NLP Tools
nlp = spacy.load("en_core_web_trf")
nltk.download("wordnet",   quiet=True)
nltk.download("stopwords", quiet=True)
stop_words = set(stopwords.words("english"))
lemmatizer = WordNetLemmatizer()
slang_dict = {"tbh":"to be honest","imo":"in my opinion","rn":"right now","u":"you"}

# Models
tokenizer       = AutoTokenizer.from_pretrained(SENTIMENT_PATH)
sentiment_model = DistilBertForSequenceClassification.from_pretrained(SENTIMENT_PATH).to(device).eval()

class TrendWiseTopicClassifier(nn.Module):
    def __init__(self, model_name="distilbert-base-uncased", num_topic=4):
        super().__init__()
        self.distilbert = DistilBertModel.from_pretrained(model_name)
        self.drop       = nn.Dropout(p=0.3)
        self.topic_head = nn.Linear(self.distilbert.config.dim, num_topic)
    def forward(self, input_ids, attention_mask):
        out = self.distilbert(input_ids=input_ids, attention_mask=attention_mask)
        return self.topic_head(self.drop(out[0][:, 0]))

topic_model = TrendWiseTopicClassifier().to(device)
topic_model.load_state_dict(torch.load(TOPIC_PATH, map_location=device, weights_only=True))
topic_model.eval()

sentiment_map = {0:"Negative", 1:"Neutral", 2:"Positive"}
topic_map     = {0:"World",    1:"Sports",  2:"Business", 3:"Sci/Tech"}

rerank_model    = CrossEncoder("cross-encoder/ms-marco-MiniLM-L-6-v2", device=device)
embedding_model = SentenceTransformer("all-MiniLM-L6-v2").to(device)

chroma_client = chromadb.PersistentClient(path=DB_PATH)
collection    = chroma_client.get_collection(name="historical_archive")

llm = ChatGoogleGenerativeAI(model="gemini-3.1-flash-lite-preview", temperature=0.2)
synthesis_prompt = ChatPromptTemplate.from_messages([
    ("system", (
        "You are the TrendWise Synthesis Engine. Your goal is to provide a concise, "
        "high-level analysis of a social media event based on provided evidence.\n\n"
        "Instructions:\n"
        "1. Synthesize the 'Original Input' with the 'Retrieved Evidence'.\n"
        "2. Keep the tone professional and analytical.\n"
        "3. Focus on the relationship between current events and historical context.\n\n"
        "Your Output Format:\n"
        "**Executive Summary:**\n"
        "**Contextual Background:**\n"
        "**Sentiment Analysis:**"
    )),
    ("human", "{layer_two_data}")
])
synthesis_chain = synthesis_prompt | llm | StrOutputParser()
print("✅ All models loaded to GPU!\n")

print("Warming up Neural Models and VectorDB...")

# 1. Warm up the Embedding Model & PyTorch
dummy_text = "This is a warmup sequence."
dummy_emb = embedding_model.encode(dummy_text).tolist()

# 2. Warm up the Reranker
rerank_model.predict([[dummy_text, dummy_text]])

# 3. Warm up ChromaDB (Forces the index into RAM)
try:
    collection.query(query_embeddings=[dummy_emb], n_results=1)
except Exception:
    pass # Ignore if the DB is completely empty on first run

print("System is fully primed and ready for instant queries!")

# ============================================================
# ML PROCESSING PIPELINE
# ============================================================
def execute_layer_one(text):
    doc      = nlp(text)
    print("Execting labels....")
    entities = [e.text for e in doc.ents if e.label_ in ["ORG","PRODUCT","PERSON"]]
    print("Finished label extraction.")
    inputs   = {k: v.to(device) for k,v in
                tokenizer(text, return_tensors="pt", truncation=True,
                          padding=True, max_length=128).items()}
    with torch.no_grad():
        print("Executing sentiment model...")
        s_logits = sentiment_model(**inputs).logits
        s_probs  = torch.softmax(s_logits, dim=1)
        s_conf, s_idx = torch.max(s_probs, dim=1)
        print("Finished sentiment model. Moving on to topic extraction.")
        t_logits = topic_model(inputs["input_ids"], inputs["attention_mask"])
        _, t_idx = torch.max(torch.softmax(t_logits, dim=1), dim=1)
        print("Finished topic extraction.")
    return {
        "original_input": text,
        "sentiment": {"label": sentiment_map[s_idx.item()],
                      "confidence_score": round(s_conf.item(), 4)},
        "topics":   [topic_map[t_idx.item()]],
        "entities": entities,
    }

def fetch_news_data(query, no_results=5):
    print("Starting new fetch...")
    if not NEWS_API_KEY: return []
    try:
        res = requests.get("https://newsapi.org/v2/everything",
            params={"q":query,"language":"en","sortBy":"relevancy","pageSize":no_results,"apiKey":NEWS_API_KEY}, timeout=8)
        if res.status_code == 200:
            print("Finished news fetch.")
            return [{"source":"NewsAPI","content":f"{a.get('title','')} - {a.get('description','')}"} for a in res.json().get("articles",[])]
    except: pass
    return []

def fetch_reddit_data(query, no_results=5):
    print("Starting reddit fetch...")
    results = []
    try:
        with DDGS() as ddgs:
            for r in ddgs.text(f"{query} site:reddit.com", max_results=no_results):
                results.append({"source":"Reddit","content":f"{r.get('title','')} - {r.get('body','')}"})
    except: pass
    print("Finished reddit fetch.")
    return results

def query_historical_archive(text, topic_filter=None, no_results=5):
    print(f"Starting optimized search (CPU-Parallel Mode)...")
    emb = embedding_model.encode(text).tolist()
    search_pool_size = no_results * 4
    
    raw_results = collection.query(
        query_embeddings=[emb], 
        n_results=search_pool_size,
    )
    
    documents = raw_results.get("documents", [[]])[0]
    metadatas = raw_results.get("metadatas", [[]])[0]
    
    filtered_output = []
    
    target_topic = topic_filter[0] if (topic_filter and len(topic_filter) > 0) else None
    
    for doc, meta in zip(documents, metadatas):
        if not target_topic or meta.get("topic") == target_topic:
            filtered_output.append({"source": "VectorDB", "content": doc})
            
        if len(filtered_output) >= no_results:
            break
            
    if len(filtered_output) < no_results:
        existing_docs = [r['content'] for r in filtered_output]
        for doc in documents:
            if doc not in existing_docs:
                filtered_output.append({"source": "VectorDB", "content": doc})
            if len(filtered_output) >= no_results:
                break

    print(f"Finished search. Returned {len(filtered_output)} high-relevance matches.")
    return filtered_output

def rerank_results(query, results, top_k=5):
    print("Starting rerank...")
    if not results: return []
    scores = rerank_model.predict([[query, r["content"]] for r in results])
    for i,r in enumerate(results): r["rerank_score"] = float(scores[i])
    print("Finished rerank.")
    return sorted(results, key=lambda x: x["rerank_score"], reverse=True)[:top_k]

def save_to_vector_db(evidence_list, topic):
    print("Starting save to vector db...")
    docs = [e["content"] for e in evidence_list if e.get("source") != "VectorDB"]
    if not docs: return
    collection.add(
        embeddings=embedding_model.encode(docs).tolist(),
        documents=docs,
        ids=[f"auto_{uuid.uuid4().hex}" for _ in docs],
        metadatas=[{"topic":topic,"source":"automated_ingest"} for _ in docs])
    print("Finished save to vector db.")

def execute_layer_two(l1_data):
    print("Starting layer two...")
    tweet  = l1_data["original_input"]
    news_q = " ".join(l1_data["entities"]) if l1_data["entities"] else l1_data["topics"][0]
    raw    = []
    raw.extend(fetch_news_data(news_q, no_results=5))
    raw.extend(fetch_reddit_data(f"{news_q} latest discussion", no_results=5))
    raw.extend(query_historical_archive(tweet, l1_data["topics"], no_results=5))
    refined = rerank_results(tweet, raw, top_k=10)
    save_to_vector_db(refined, l1_data["topics"][0])
    print("Finished layer two.")
    return {"signals": l1_data, "evidence": refined}

def execute_layer_three(layer_two_data):
    print("Starting layer three...")
    return synthesis_chain.invoke({"layer_two_data": json.dumps(layer_two_data, indent=2)})


# ============================================================
# API ROUTES
# ============================================================
app = FastAPI(title="TrendWise GPU Engine")

# Security: Only allow requests from your Node.js Gateway
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5000", "http://127.0.0.1:5000"], 
    allow_methods=["POST", "GET"],
    allow_headers=["*"],
)

class AnalyzeRequest(BaseModel):
    text: str

@app.get("/health")
def health():
    return {"status": "ok", "device": str(device)}

@app.post("/analyze")
def analyze(req: AnalyzeRequest):
    """Executes the NLP pipeline and returns pure ML data to the Node Gateway."""
    print(f"gpu_engine: Processing text: {req.text[:50]}...")
    l1        = execute_layer_one(req.text)
    l2        = execute_layer_two(l1)
    synthesis = execute_layer_three(l2)

    return {
        "signals":    l2["signals"],
        "evidence":   l2["evidence"],
        "synthesis":  synthesis,
        "topic":      l1["topics"][0],
        "sentiment":  l1["sentiment"]
    }