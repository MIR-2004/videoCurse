import cv2
import numpy as np

def apply_filter(frame, actions):
    img = cv2.cvtColor(frame, cv2.COLOR_RGB2BGR)

    for action in actions:
        name = action.get("action")
        value = action.get("value")

        if name == "contrast":
            img = adjust_contrast(img, value)
        elif name == "brightness":
            img = adjust_brightness(img, value)
        elif name == "grayscale":
            img = cv2.cvtColor(img, cv2.COLOR_BGR2GRAY)
            img = cv2.cvtColor(img, cv2.COLOR_GRAY2BGR)

    return cv2.cvtColor(img, cv2.COLOR_BGR2RGB)

def adjust_contrast(img, percent):
    factor = 1 + percent / 100.0
    return cv2.convertScaleAbs(img, alpha=factor, beta=0)

def adjust_brightness(img, percent):
    return cv2.convertScaleAbs(img, alpha=1, beta=percent)
