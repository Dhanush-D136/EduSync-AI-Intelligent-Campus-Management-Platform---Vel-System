from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from db.database import get_db
from models.models import Student, AttendanceRecord
from datetime import date

router = APIRouter()

@router.get("/stats")
def get_dashboard_stats(db: Session = Depends(get_db)):
    total_students = db.query(Student).count()
    
    today = date.today()
    
    # Normally we query where date equals today. Let's do a simple count for MVP.
    # To handle SQLite vs PG date casting generically:
    # Just query all records and filter in python for quick local MVP OR use robust sqlalchemy filters.
    records = db.query(AttendanceRecord).all()
    present_count = sum(1 for r in records if r.date.date() == today and r.status.value == "PRESENT")
    
    absent_count = total_students - present_count
    
    # Safely compute accuracy
    accuracy = 100.0
    if total_students > 0:
        accuracy = round((present_count / total_students) * 100, 1)
        
    recent_attendance = []
    for r in reversed(records):
        if r.date.date() == today and r.status.value == "PRESENT":
            student = db.query(Student).filter(Student.id == r.student_id).first()
            if student:
                recent_attendance.append({
                    "id": student.register_number,
                    "name": student.name,
                    "dept": student.department,
                    "section": student.section,
                    "period": "P5",
                    "status": "Present",
                    "confidence": int(r.confidence_score * 100) if r.confidence_score else 90,
                    "time": r.date.strftime("%I:%M %p")
                })
                
    return {
        "total": total_students,
        "present": present_count,
        "absent": absent_count,
        "accuracy": f"{accuracy}%",
        "active_classes": 1,
        "recent_attendance": recent_attendance
    }
