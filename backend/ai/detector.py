from ultralytics import YOLO

class FaceDetector:
    def __init__(self, model_path="yolov8n-face.pt", conf_thresh=0.5):
        try:
            # We attempt to load a YOLO face model if available
            self.model = YOLO(model_path)
            self.is_face_model = True
        except Exception:
            # Fallback to standard yolov8 object detection (class 0 = person)
            # In a true production environment, YOLOv8-face weights must be provided
            self.model = YOLO("yolov8n.pt")
            self.is_face_model = False
            print("WARNING: yolov8n-face.pt not found. Falling back to yolov8n.pt (person detection).")
            
        self.conf_thresh = conf_thresh

    def detect(self, frame):
        # detection
        results = self.model(frame, verbose=False, conf=self.conf_thresh)
        detections = []
        for result in results:
            boxes = result.boxes
            for box in boxes:
                # Bounding box xyxy format
                x1, y1, x2, y2 = box.xyxy[0].cpu().numpy()
                conf = float(box.conf[0].cpu().numpy())
                cls = int(box.cls[0].cpu().numpy())
                
                # If face model, assume cls 0 is face. If generic, cls 0 is person.
                if cls == 0:
                    # DeepSort requires [left, top, w, h]
                    w = int(x2 - x1)
                    h = int(y2 - y1)
                    detections.append(([int(x1), int(y1), w, h], conf, cls))
        return detections
