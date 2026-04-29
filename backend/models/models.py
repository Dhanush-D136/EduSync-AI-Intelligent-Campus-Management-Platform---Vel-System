from sqlalchemy import Column, Integer, String, Enum, Float, DateTime, ForeignKey, JSON
from db.database import Base
from datetime import datetime
import enum

class AttendanceStatus(str, enum.Enum):
    PRESENT = "PRESENT"
    ABSENT = "ABSENT"
    LATE = "LATE"

class Student(Base):
    __tablename__ = "students"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, index=True)
    register_number = Column(String, unique=True, index=True)
    department = Column(String)
    year = Column(Integer)
    section = Column(String)
    password = Column(String, default="1234")
    first_login = Column(Integer, default=1) # SQLite doesn't have true boolean
    
    # Storing embeddings as JSON for compatibility across databases (SQLite/PostgreSQL)
    # A list of embeddings per student (e.g. 6 images = 6 embeddings)
    embeddings = Column(JSON, nullable=True)
    
    # Store encoded paths for visualizations
    photo_paths = Column(JSON, nullable=True)

class AttendanceRecord(Base):
    __tablename__ = "attendance_records"

    id = Column(Integer, primary_key=True, index=True)
    student_id = Column(Integer, ForeignKey("students.id"))
    date = Column(DateTime, default=datetime.utcnow)
    status = Column(Enum(AttendanceStatus), default=AttendanceStatus.ABSENT)
    confidence_score = Column(Float, nullable=True)

class Timetable(Base):
    __tablename__ = "timetables"

    id = Column(Integer, primary_key=True, index=True)
    year = Column(Integer)
    section = Column(String)
    period_start = Column(String) # e.g., "09:00"
    period_end = Column(String)   # e.g., "10:00"
