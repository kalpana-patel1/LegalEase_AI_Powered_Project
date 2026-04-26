import os
from dotenv import load_dotenv
load_dotenv()

print("loaded hf token:" , os.getenv("HF_TOKEN"))