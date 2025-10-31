import axios from "axios";
import fs from "fs";
import FormData from "form-data";

export const processWithPython = async (videoPath: string, actions: any) => {
    const formData = new FormData();

    formData.append("file", fs.createReadStream(videoPath));
    formData.append("actions", JSON.stringify(actions));

    const response = await axios.post(process.env.PYTHON_BACKEND!, formData, {
        headers: formData.getHeaders(),
    })

    return response.data.outputPath;
}