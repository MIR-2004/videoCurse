from fastapi import FastAPI, UploadFile, Form
from fastapi.responses import JSONResponse
import uuid
import os
import json
from utils.video_utils import process_video

app = FastAPI()

@app.post("/process")
async def process_video_endpoint(file: UploadFile, actions: str = Form(...)):
    try:
        input_path = f"temp/{uuid.uuid4()}_{file.filename}"
        output_path = f"temp/output_{uuid.uuid4()}.mp4"

        # Save uploaded file
        with open(input_path, "wb") as f:
            f.write(await file.read())

        parsed_actions = json.loads(actions)
        process_video(input_path, parsed_actions, output_path)

        return JSONResponse({
            "success": True,
            "output_path": output_path
        })
    except Exception as e:
        return JSONResponse({"error": str(e)}, status_code=500)
