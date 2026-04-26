import os
from dotenv import load_dotenv
import streamlit as st
import pdfplumber
from transformers import pipeline
import asyncio
import base64

# Fix asyncio
try:
    asyncio.get_running_loop()
except RuntimeError:
    asyncio.set_event_loop(asyncio.new_event_loop())

# Load env
load_dotenv()
hf_token = os.getenv("HF_TOKEN")

# Load model (only once)
@st.cache_resource
def load_summarizer():
    return pipeline(
        "summarization",
        model="facebook/bart-large-cnn",
        token=hf_token
    )

summarizer = load_summarizer()

# Extract text
def extract_text_from_pdf(uploaded_file):
    text = ""
    with pdfplumber.open(uploaded_file) as pdf:
        for page in pdf.pages:
            if page.extract_text():
                text += page.extract_text() + "\n"
    return text if text else "[ERROR] no text found"

#  SPLIT TEXT
def split_text(text, max_chars=1200):
    sentences = text.split(". ")
    chunks = []
    current = ""

    for sentence in sentences:
        if len(current) + len(sentence) < max_chars:
            current += sentence + ". "
        else:
            chunks.append(current.strip())
            current = sentence + ". "

    if current:
        chunks.append(current.strip())

    return chunks

#  SUMMARIZE LONG TEXT
def summarize_long_text(text):
    chunks = split_text(text)

    #  LIMIT CHUNKS (prevents overload)
    chunks = chunks[:8]

    summaries = []

    for i, chunk in enumerate(chunks):
        try:
            result = summarizer(
                chunk,
                max_length=120,
                min_length=40,
                do_sample=False
            )[0]['summary_text']

            summaries.append(result)

        except Exception as e:
            print(f"Error in chunk {i}: ", e)

    return " ".join(summaries)


# UI
st.write("Upload a legal document (PDF)")

uploaded_file = st.file_uploader("Upload PDF", type=["pdf"])

if uploaded_file:
    with st.spinner("Extracting text..."):
        text = extract_text_from_pdf(uploaded_file)

    if text.startswith("[ERROR]"):
        st.error(text)
    else:
        #  AVOID HUGE PDF (WRITE HERE)
        if len(text) > 40000:
            st.warning("Large file detected...")
            text = text[:40000].rsplit('.', 1)[0]

        st.success("Text extracted!")

        with st.spinner("Summarizing..."):
            #  PREVENT CRASH (WRITE HERE)
            try:
                summary = summarize_long_text(text)
            except Exception:
                summary = "Error while summarizing document."

        st.markdown("### Summary")
        st.info(summary)

        # Download
        summary_bytes = summary.encode('utf-8')
        b64 = base64.b64encode(summary_bytes).decode()

        href = f'<a href="data:file/text;base64,{b64}" download="summary.txt">Download Summary</a>'
        st.markdown(href, unsafe_allow_html=True)