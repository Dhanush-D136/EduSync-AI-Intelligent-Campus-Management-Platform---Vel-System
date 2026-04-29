import os
import sys

sys.path.append(os.path.dirname(os.path.abspath(__file__)))

print("Initializing AI Pipeline to trigger model downloads...")
from ai.pipeline import AttendancePipeline

try:
    print("Downloading YOLO and FaceNet models...")
    pipeline = AttendancePipeline(match_thresh=0.6, req_frames=10)
    print("Successfully loaded AI models to local cache!")
except Exception as e:
    print(f"Error during model initialization: {e}")
    sys.exit(1)
