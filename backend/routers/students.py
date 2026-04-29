import os
import uuid
from fastapi import APIRouter, Depends, HTTPException, UploadFile, File, Form
from sqlalchemy.orm import Session
from db.database import get_db
from models.models import Student
from ai.recognizer import FaceRecognizer
from ai.detector import FaceDetector
from typing import List, Optional
import cv2
import numpy as np
import json

router = APIRouter()
# We init a lightweight recognizer and detector just for embedding extraction on upload
recognizer = FaceRecognizer()
detector = FaceDetector(conf_thresh=0.5)

STORAGE_DIR = os.path.join(os.path.dirname(os.path.dirname(__file__)), "storage", "faces")
os.makedirs(STORAGE_DIR, exist_ok=True)

@router.post("")
@router.post("/")
async def create_student(
    name: str = Form(...),
    register_number: str = Form(...),
    department: str = Form(...),
    year: int = Form(...),
    section: str = Form(...),
    photos: Optional[List[UploadFile]] = File(None),
    db: Session = Depends(get_db)
):
    """
    Registers a new student, optionally saves physical photos, extracts exactly cropped faces,
    and returns FaceNet embeddings.
    """
    embeddings = []
    saved_paths = []
    student_uuid = str(uuid.uuid4())[:8]

    if photos:
        if len(photos) > 6:
            raise HTTPException(status_code=400, detail="Maximum 6 photos allowed")
        
        for i, photo in enumerate(photos):
            contents = await photo.read()
            nparr = np.frombuffer(contents, np.uint8)
            img = cv2.imdecode(nparr, cv2.IMREAD_COLOR)

            if img is None:
                continue
                
            # Detect face coordinates
            detections = detector.detect(img)
            if not detections:
                continue # Skip images with no faces
                
            # Assume the highest confidence face is our target
            best_det = max(detections, key=lambda d: d[1])
            (x, y, w, h) = best_det[0]
            
            # Boundary protection
            x, y = max(0, x), max(0, y)
            face_crop = img[y:y+h, x:x+w]
            
            # Save physical cropped face for auditing/reference
            filename = f"{register_number}_{student_uuid}_{i}.jpg"
            filepath = os.path.join(STORAGE_DIR, filename)
            cv2.imwrite(filepath, face_crop)
            saved_paths.append(filepath)
                
            # Extract the deep embedding on the specifically cropped face
            emb = recognizer.get_embedding(face_crop)
            if emb is not None:
                # Convert numpy array to list for JSON serialization
                embeddings.append(emb.tolist())
    
    
    # if not embeddings and photos:
    #     raise HTTPException(status_code=400, detail="Could not extract AI faces from the provided images. Ensure faces are clearly visible.")
        
    student = Student(
        name=name,
        register_number=register_number,
        department=department,
        year=year,
        section=section,
        embeddings=embeddings, # Store as JSON
        photo_paths=saved_paths # Store file paths
    )
    
    try:
        db.add(student)
        db.commit()
        db.refresh(student)
    except Exception as e:
        db.rollback()
        raise HTTPException(status_code=500, detail=f"Database error: {str(e)}")
    
    return {"message": "Student created successfully", "student_id": student.id}

@router.get("")
@router.get("/")
def get_students(db: Session = Depends(get_db)):
    # Return students mapped properly to JSON objects for the frontend
    students = db.query(Student).all()
    return [{
        "id": s.id, 
        "name": s.name, 
        "register_number": s.register_number, 
        "department": s.department, 
        "year": s.year, 
        "section": s.section,
        "has_face": bool(s.embeddings),
        "pwd": s.password or "1234",
        "firstLogin": bool(s.first_login)
    } for s in students]

@router.delete("/{student_id}")
def delete_student(student_id: int, db: Session = Depends(get_db)):
    student = db.query(Student).filter(Student.id == student_id).first()
    if not student:
        raise HTTPException(status_code=404, detail="Student not found")
    
    db.delete(student)
    db.commit()
    return {"message": "Student deleted"}

from pydantic import BaseModel

class PasswordUpdate(BaseModel):
    password: str

@router.put("/{student_id}/password")
def update_password(student_id: int, data: PasswordUpdate, db: Session = Depends(get_db)):
    student = db.query(Student).filter(Student.id == student_id).first()
    if not student:
        raise HTTPException(status_code=404, detail="Student not found")
    
    student.password = data.password
    student.first_login = 0
    db.commit()
    return {"message": "Password updated successfully"}

@router.post("/{student_id}/face")
async def register_face(
    student_id: int, 
    photos: List[UploadFile] = File(...),
    db: Session = Depends(get_db)
):
    student = db.query(Student).filter(Student.id == student_id).first()
    if not student:
        raise HTTPException(status_code=404, detail="Student not found")

    if len(photos) > 6:
        raise HTTPException(status_code=400, detail="Maximum 6 photos allowed")

    embeddings = []
    saved_paths = []
    student_uuid = str(uuid.uuid4())[:8]

    for i, photo in enumerate(photos):
        contents = await photo.read()
        nparr = np.frombuffer(contents, np.uint8)
        img = cv2.imdecode(nparr, cv2.IMREAD_COLOR)

        if img is None:
            continue
            
        detections = detector.detect(img)
        if not detections:
            continue 
            
        best_det = max(detections, key=lambda d: d[1])
        (x, y, w, h) = best_det[0]
        
        x, y = max(0, x), max(0, y)
        face_crop = img[y:y+h, x:x+w]
        
        filename = f"{student.register_number}_{student_uuid}_{i}.jpg"
        filepath = os.path.join(STORAGE_DIR, filename)
        cv2.imwrite(filepath, face_crop)
        saved_paths.append(filepath)
            
        emb = recognizer.get_embedding(face_crop)
        if emb is not None:
            embeddings.append(emb.tolist())
            
    if not embeddings:
        raise HTTPException(status_code=400, detail="Could not extract AI faces from the provided images. Ensure faces are clearly visible.")
        
    student.embeddings = embeddings
    student.photo_paths = saved_paths
    db.commit()
    return {"message": "Faces registered successfully"}
