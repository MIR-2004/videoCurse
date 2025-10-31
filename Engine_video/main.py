from fastapi import FastAPI, UploadFile, Form, HTTPException, Header
from fastapi.responses import FileResponse
import os, json
from processor import process_video
from config import API_KEY, INPUT_DIR, OUTPUT_DIR

app = FastAPI(title="VidPrompt Video Engine")

@app.post("/process")
async def process(
    file: UploadFile,
    actions: str = Form(...),
    x_api_key: str = Header(None)
):
    # API Key check
    if x_api_key != API_KEY:
        raise HTTPException(status_code=401, detail="Invalid API Key")

    os.makedirs(INPUT_DIR, exist_ok=True)
    os.makedirs(OUTPUT_DIR, exist_ok=True)

    # Save input file
    input_path = os.path.join(INPUT_DIR, file.filename)
    with open(input_path, "wb") as f:
        f.write(await file.read())

    # Parse actions JSON
    try:
        actions_data = json.loads(actions)
    except json.JSONDecodeError:
        raise HTTPException(status_code=400, detail="Invalid JSON")

    output_path = os.path.join(OUTPUT_DIR, f"edited_{file.filename}")

    # Process the video
    process_video(input_path, actions_data, output_path)

    return {"status": "success", "output": output_path}
