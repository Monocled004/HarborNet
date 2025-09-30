from sqlalchemy import Column, Integer, String, Numeric, Boolean, Date, ForeignKey
from sqlalchemy.orm import relationship
from database.connect import Base
from mongoengine import Document, StringField, ListField, IntField

# ------------------ SQL ------------------

class Citizens(Base):
    __tablename__ = 'citizens'

    id = Column(Integer, primary_key=True)
    mobile = Column(String(10), unique=True, nullable=True)
    email = Column(String(40), unique=True, nullable=True)
    password = Column(String(100), nullable=False)


class Employees(Base):
    __tablename__ = 'employees'

    id = Column(Integer, primary_key=True, autoincrement=True)
    email = Column(String(40), unique=True)
    password = Column(String(100), nullable=False)


class Volunteers(Base):
    __tablename__ = 'volunteers'

    id = Column(Integer, primary_key=True, autoincrement=True)
    contact = Column(String(10), unique=True, nullable=False)
    email = Column(String(40), unique=False)
    password = Column(String(100), nullable=False)
    at_NGO = Column(Integer, ForeignKey('ngo.id'), nullable=False)

    # Proper relationship using back_populates
    ngo = relationship('NGO', back_populates='volunteers')


class NGO(Base):
    __tablename__ = 'ngo'

    id = Column(Integer, primary_key=True, autoincrement=True)
    name = Column(String(40), nullable=False)
    email = Column(String(30), nullable=True)
    pincode = Column(String(6), nullable=False)
    contact_1 = Column(String(14), nullable=False)

    # Relationships
    volunteers = relationship('Volunteers', back_populates='ngo')
    uploads = relationship('Uploads', back_populates='ngo')


class Uploads(Base):
    __tablename__ = 'uploads'

    id = Column(String(10), primary_key=True)
    uploader_id = Column(Integer, ForeignKey('citizens.id'), nullable=False)  # Reference Citizens
    issue_date = Column(Date, nullable=True)
    issue_latitude = Column(Numeric(10, 8), nullable=True)
    issue_longitude = Column(Numeric(11, 8), nullable=True)
    issue_nearby_uploader = Column(Boolean, nullable=False)
    uploader_date = Column(Date, nullable=False)
    uploaders_pincode = Column(String(6), nullable=False)
    nearby_NGO = Column(Integer, ForeignKey('ngo.id'), nullable=True)
    # Removed description, image_path, video_path, issue_category (now in MongoDB)

    # Proper relationship using back_populates
    ngo = relationship('NGO', back_populates='uploads')
    uploader = relationship('Citizens')


# ------------------ Social Media Posts (SQL) ------------------

class SocialPost(Base):
    __tablename__ = 'social_posts'
    id = Column(Integer, primary_key=True, autoincrement=True)
    platform = Column(String(50), nullable=False)
    content = Column(String(1000), nullable=False)
    username = Column(String(255), nullable=True)
    timestamp = Column(String(100), nullable=True)

# ------------------ MongoDB ------------------

class Mongo_Uploads(Document):
    id = IntField(primary_key=True, required=True)  # Same as SQL Uploads.id
    image_path = StringField()
    video_path = StringField()
    description = StringField(max_length=600)
    issue_category = StringField(required=False)
    issue_predicted_category = ListField(StringField(), required=True)
