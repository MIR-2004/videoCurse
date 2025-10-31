import cv2

def adjust_contrast(input_path, output_path, value):
    cap = cv2.VideoCapture(input_path)
    fourcc = cv2.VideoWriter_fourcc(*'mp4v')
    fps = cap.get(cv2.CAP_PROP_FPS)
    width = int(cap.get(3))
    height = int(cap.get(4))
    out = cv2.VideoWriter(output_path, fourcc, fps, (width, height))

    contrast_factor = 1 + (value / 100.0)

    while True:
        ret, frame = cap.read()
        if not ret:
            break
        frame = cv2.convertScaleAbs(frame, alpha=contrast_factor, beta=0)
        out.write(frame)

    cap.release()
    out.release()


def adjust_brightness(input_path, output_path, value):
    cap = cv2.VideoCapture(input_path)
    fourcc = cv2.VideoWriter_fourcc(*'mp4v')
    fps = cap.get(cv2.CAP_PROP_FPS)
    width = int(cap.get(3))
    height = int(cap.get(4))
    out = cv2.VideoWriter(output_path, fourcc, fps, (width, height))

    while True:
        ret, frame = cap.read()
        if not ret:
            break
        frame = cv2.convertScaleAbs(frame, alpha=1, beta=value)
        out.write(frame)

    cap.release()
    out.release()
