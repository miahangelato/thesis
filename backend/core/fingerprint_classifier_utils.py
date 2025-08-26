# ml/fingerprint_classifier.py
import os
from django.conf import settings
import tensorflow as tf
from tensorflow.keras.preprocessing import image
import numpy as np

MODEL_PATH = os.path.join(settings.BASE_DIR, "core", "improved_pattern_cnn_model.h5")
CLASS_NAMES = ["Arc", "Whorl", "Loop"]

model = tf.keras.models.load_model(MODEL_PATH)

def classify_fingerprint_pattern(img_file):
    img = image.load_img(img_file, color_mode="grayscale", target_size=(128, 128))
    x = image.img_to_array(img)
    x = np.expand_dims(x, axis=0) / 255.0
    preds = model.predict(x)
    return CLASS_NAMES[np.argmax(preds)]
