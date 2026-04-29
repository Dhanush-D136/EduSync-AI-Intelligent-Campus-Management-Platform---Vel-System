import cv2
import asyncio
from fastapi import APIRouter, Depends
from fastapi.responses import StreamingResponse
from sqlalchemy.orm import Session
from db.database import get_db, SessionLocal
from models.models import Student, AttendanceRecord, AttendanceStatus
from ai.pipeline import AttendancePipeline
import json

router = APIRouter()
pipeline = AttendancePipeline()

def get_known_students(db: Session):
    students = db.query(Student).all()
    known = []
    for s in students:
        if s.embeddings:
            embs = json.loads(s.embeddings) if isinstance(s.embeddings, str) else s.embeddings
            known.append({
                "id": s.id,
                "name": s.name,
                "embeddings": embs
            })
    return known

async def generate_frames():
    db = SessionLocal()
    cap = cv2.VideoCapture(0)
    
    try:
        # Fetch knowledge base once
        known_students = get_known_students(db)
        
        while cap.isOpened():
            success, frame = cap.read()
            if not success:
                await asyncio.sleep(0.5)
                continue
                
            # Process frame through YOLO + FaceNet AI Pipeline
            labeled_frame, actions = pipeline.process_frame(frame, known_students)
            
            # Log attendance autonomously
            if actions:
                for action in actions:
                    student_id = action["student_id"]
                    # Log if not already present TODAY
                    from datetime import datetime, time
                    today_start = datetime.combine(datetime.today().date(), time.min)
                    exists = db.query(AttendanceRecord).filter(
                        AttendanceRecord.student_id == student_id,
                        AttendanceRecord.date >= today_start
                    ).first()
                    
                    if not exists:
                        record = AttendanceRecord(
                            student_id=student_id,
                            status=AttendanceStatus.PRESENT,
                            confidence_score=action["confidence"]
                        )
                        db.add(record)
                        db.commit()
                        print(f"[AI PIPELINE] Verified & logged attendance for {action['name']}!")

            ret, buffer = cv2.imencode('.jpg', labeled_frame)
            frame_bytes = buffer.tobytes()
            
            yield (b'--frame\r\n'
                   b'Content-Type: image/jpeg\r\n\r\n' + frame_bytes + b'\r\n')
                   
            await asyncio.sleep(0.02)
    finally:
        db.close()
        cap.release()

@router.get("/stream")
def video_feed():
    """
    Independent generator thread. Streams MJPEG stream with YOLO CNN bounding boxes.
    """
    return StreamingResponse(generate_frames(), media_type="multipart/x-mixed-replace; boundary=frame")
