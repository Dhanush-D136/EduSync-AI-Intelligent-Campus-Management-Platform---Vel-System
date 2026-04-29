import cv2
import numpy as np
from ai.detector import FaceDetector
from ai.tracker import FaceTracker
from ai.recognizer import FaceRecognizer

class AttendancePipeline:
    def __init__(self, match_thresh=0.6, req_frames=10):
        # Initialize our heavy models
        self.detector = FaceDetector(conf_thresh=0.5)
        self.tracker = FaceTracker()
        self.recognizer = FaceRecognizer()
        
        # Configuration rules
        self.match_thresh = match_thresh
        self.req_frames = req_frames
        
        # In-memory session state
        # tracking_state = { track_id: {"hits": 0, "name": "Unknown", "student_id": None, "conf": 0.0} }
        self.tracking_state = {}

    def process_frame(self, frame, known_students):
        """
        known_students: list of dicts: {"student_id": int, "name": str, "embeddings": list_of_embeddings}
        returns: (annotated_frame, recognized_actions)
        """
        # 1. Detect
        detections = self.detector.detect(frame)
        
        # 2. Track
        tracks = self.tracker.update(detections, frame)
        
        recognized_actions = []
        
        for track in tracks:
            if not track.is_confirmed() or track.time_since_update > 1:
                continue
                
            track_id = track.track_id
            ltrb = track.to_ltrb() # Left, Top, Right, Bottom
            left, top, right, bottom = map(int, ltrb)
            
            # Boundary checks
            left = max(0, left)
            top = max(0, top)
            right = min(frame.shape[1], right)
            bottom = min(frame.shape[0], bottom)
            
            # Process recognition only if face is a decent size and we haven't locked it yet
            if track_id not in self.tracking_state:
                self.tracking_state[track_id] = {
                    "hits": 0, "name": "Unknown", "student_id": None, "conf": 0.0, "locked": False
                }
            
            state = self.tracking_state[track_id]
            
            # 3. Recognition (Compute embedding on current face patch)
            if not state["locked"] and right > left and bottom > top:
                face_crop = frame[top:bottom, left:right]
                # Filter out very tiny faces to save compute and keep quality high
                if face_crop.shape[0] > 40 and face_crop.shape[1] > 40:
                    emb = self.recognizer.get_embedding(face_crop)
                    
                    if emb is not None:
                        # Find best match
                        best_match = None
                        best_score = -1.0
                        
                        for student in known_students:
                            # A student can have multiple embedded face variations (e.g. 6 images)
                            for db_emb in student.get("embeddings", []):
                                if db_emb is None: continue
                                score = self.recognizer.compute_similarity(emb, db_emb)
                                if score > best_score:
                                    best_score = score
                                    best_match = student
                        
                        # We demand a confident match
                        if best_score >= self.match_thresh:
                            # If the same student is detected over consecutive frames, we accumulate hits
                            if state["student_id"] == best_match["id"]:
                                state["hits"] += 1
                                # Smooth confidence visually
                                state["conf"] = (state["conf"] + best_score) / 2
                            else:
                                state["student_id"] = best_match["id"]
                                state["name"] = best_match["name"]
                                state["hits"] = 1
                                state["conf"] = best_score
                                
                            # If hits > req_frames, Lock and trigger attendance record
                            if state["hits"] >= self.req_frames:
                                state["locked"] = True
                                recognized_actions.append({
                                    "student_id": state["student_id"],
                                    "name": state["name"],
                                    "confidence": state["conf"]
                                })
            
            # 4. Draw overlays
            color = (0, 0, 255) # Red for unknown
            label = f"ID: {track_id} - Unknown"
            
            if state["locked"]:
                color = (0, 255, 0) # Green for Present
                label = f"{state['name']} ({state['conf']:.2f})"
            elif state["hits"] > 0:
                color = (0, 255, 255) # Yellow for recognizing...
                label = f"Matching... {state['hits']}/{self.req_frames}"

            cv2.rectangle(frame, (left, top), (right, bottom), color, 2)
            cv2.putText(frame, label, (left, top - 10), cv2.FONT_HERSHEY_SIMPLEX, 0.6, color, 2)

        return frame, recognized_actions
