from fastapi import APIRouter, Depends
from fastapi.responses import Response
from sqlalchemy.orm import Session
from db.database import get_db
from models.models import Student, AttendanceRecord
import csv
import io

router = APIRouter()

@router.get("/export")
def export_attendance_csv(db: Session = Depends(get_db)):
    # Join records and students
    records = db.query(AttendanceRecord, Student).join(
        Student, AttendanceRecord.student_id == Student.id
    ).order_by(AttendanceRecord.date.desc()).all()

    # Write to in-memory string buffer
    output = io.StringIO()
    writer = csv.writer(output)
    
    # Header
    writer.writerow([
        "Record ID", 
        "Date", 
        "Time",
        "Student Name", 
        "Register Number", 
        "Department", 
        "Year", 
        "Section", 
        "Status", 
        "Confidence (%)"
    ])
    
    # Data rows
    for record, student in records:
        writer.writerow([
            record.id,
            record.date.strftime("%Y-%m-%d"),
            record.date.strftime("%H:%M:%S"),
            student.name,
            student.register_number,
            student.department,
            student.year,
            student.section,
            record.status.value if record.status else "UNKNOWN",
            f"{int(record.confidence_score * 100)}%" if record.confidence_score else "N/A"
        ])
        
    output.seek(0)
    
    return Response(
        content=output.getvalue(),
        media_type="text/csv",
        headers={"Content-Disposition": "attachment; filename=attendance_report.csv"}
    )
