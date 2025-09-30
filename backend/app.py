
# --- Begin: Logic from yash/app.py ---

from flask import Flask, request, jsonify
import os
from werkzeug.utils import secure_filename
from database.db_models import Mongo_Uploads
from flask_cors import CORS
import sys
from database.crud import check_user, verify_user, add_new_user
from database.connect import SessionLocal, init_db, Base, engine
from database.db_models import Citizens
from database.db_models import SocialPost
from AI.fetch_posts import fetch_and_store_all

app = Flask(__name__)
CORS(app)

Base.metadata.create_all(engine)
init_db()

# ...existing code...

# Place these endpoints after app = Flask(__name__)

# API endpoint to fetch and store social media posts
@app.route('/api/fetch_socialmedia', methods=['POST'])
def api_fetch_socialmedia():
    result = fetch_and_store_all()
    return jsonify(result)

# API endpoint to get recent social media posts
@app.route('/api/socialmedia_posts', methods=['GET'])
def api_socialmedia_posts():
    session = SessionLocal()
    posts = session.query(SocialPost).order_by(SocialPost.id.desc()).limit(50).all()
    result = [
        {
            'id': p.id,
            'platform': p.platform,
            'content': p.content,
            'username': p.username,
            'timestamp': p.timestamp
        } for p in posts
    ]
    session.close()
    return jsonify(result)



from flask import send_from_directory
# Serve uploaded files
@app.route('/uploads/<path:filename>')
def uploaded_file(filename):
    upload_folder = os.path.join(os.getcwd(), 'uploads')
    return send_from_directory(upload_folder, filename)


# (Moved) API endpoint to reject (delete) a report

# ...existing code...

# Place this after app = Flask(__name__)

@app.route('/api/report/reject', methods=['POST'])
def reject_report():
    try:
        from database.db_models import Uploads, Mongo_Uploads
        session = SessionLocal()
        data = request.get_json()
        report_id = data.get('id')
        if not report_id:
            session.close()
            return jsonify({'success': False, 'error': 'Missing report id'}), 400
        # Delete from SQL
        upload = session.query(Uploads).filter_by(id=str(report_id)).first()
        if upload:
            session.delete(upload)
            session.commit()
        # Delete from MongoDB
        mongo = Mongo_Uploads.objects(id=int(report_id)).first()
        if mongo:
            mongo.delete()
        session.close()
        return jsonify({'success': True, 'message': 'Report rejected and deleted.'}), 200
    except Exception as e:
        return jsonify({'success': False, 'error': str(e)}), 500



# API endpoint to approve (verify) a report
@app.route('/api/report/approve', methods=['POST'])
def approve_report():
    try:
        from database.db_models import Uploads
        session = SessionLocal()
        data = request.get_json()
        report_id = data.get('id')
        if not report_id:
            session.close()
            return jsonify({'success': False, 'error': 'Missing report id'}), 400
        upload = session.query(Uploads).filter_by(id=str(report_id)).first()
        if not upload:
            session.close()
            return jsonify({'success': False, 'error': 'Report not found'}), 404
        upload.issue_nearby_uploader = True
        session.commit()
        session.close()
        return jsonify({'success': True, 'message': 'Report approved (verified).'}), 200
    except Exception as e:
        return jsonify({'success': False, 'error': str(e)}), 500





# API endpoint for fetching reports (join SQL and MongoDB by id)
@app.route('/api/reports', methods=['GET'])
def get_reports():
    from database.db_models import Uploads, Mongo_Uploads, Citizens
    session = SessionLocal()
    verified = request.args.get('verified')
    uploader_id = request.args.get('uploader_id')
    query = session.query(Uploads)
    if verified == 'false':
        query = query.filter_by(issue_nearby_uploader=False)
    elif verified == 'true':
        query = query.filter_by(issue_nearby_uploader=True)
    if uploader_id:
        query = query.filter_by(uploader_id=int(uploader_id))
    uploads = query.all()
    result = []
    for u in uploads:
        mongo = Mongo_Uploads.objects(id=int(u.id)).first()
        citizen = session.query(Citizens).filter_by(id=u.uploader_id).first()
        result.append({
            'id': u.id,
            'uploader_id': u.uploader_id,
            'uploader': citizen.email if citizen else None,
            'category': getattr(mongo, 'issue_category', None) if mongo else None,
            'status': 'verified' if u.issue_nearby_uploader else 'unverified',
            'description': getattr(mongo, 'description', None) if mongo else None,
            'image_path': getattr(mongo, 'image_path', None) if mongo else None,
            'video_path': getattr(mongo, 'video_path', None) if mongo else None,
            'latitude': float(u.issue_latitude) if u.issue_latitude is not None else None,
            'longitude': float(u.issue_longitude) if u.issue_longitude is not None else None
        })
    session.close()
    return jsonify(result)



# API endpoint for overview panel stats
@app.route('/api/overview', methods=['GET'])
def api_overview():
    # Count by category and verification status
    categories = ['Flooding', 'Tsunami', 'High Waves', 'Coastal Damage', 'Other']
    overview = {}
    for cat in categories:
        overview[cat.replace(' ', '').lower()] = Mongo_Uploads.objects(issue_category=cat).count()
    overview['verified'] = Mongo_Uploads.objects(status='verified').count()
    overview['unverified'] = Mongo_Uploads.objects(status='unverified').count()
    return jsonify(overview)



# API endpoint for login (refactored to use SIH logic)
@app.route('/api/login', methods=['POST'])
def api_login():
    
    data = request.get_json()
    identifier = data.get('loginInput')
    password = data.get('password')
    
    if not identifier or not password:
        return jsonify({"success": False, "error": "Missing credentials"}), 400
    
    from database.crud import check_user
    if verify_user(identifier, password):
        user_id = check_user(identifier)
        return jsonify({"success": True, "user": {"id": user_id, "identifier": identifier}}), 200
    
    return jsonify({"success": False, "error": "Invalid credentials"}), 401



# API endpoint for registration (refactored to use SIH logic)
@app.route('/api/register', methods=['POST'])
def api_register():
    data = request.get_json()
    identifier = data.get('loginInput')
    password = data.get('password')
    confirm = data.get('confirmPassword')
    
    if not identifier or not password or not confirm:
        return jsonify({"success": False, "error": "Missing fields"}), 400
    if password != confirm:
        return jsonify({"success": False, "error": "Passwords do not match"}), 400
    
    # Use SIH add_new_user
    if not check_user(identifier):
        if '@' in identifier:
            phone = None
            email = identifier
        else: 
            phone = identifier
            email = None
        add_new_user(phone=phone, email=email, password=password)
    user_id = check_user(identifier)
    return jsonify({"success": True, "user": {"id": user_id, "identifier": identifier}}), 201



# API endpoint to submit hazard report
@app.route('/api/report', methods=['POST'])
def api_report():
    try:
        from database.db_models import Citizens, Uploads, Mongo_Uploads
        from datetime import date
        session = SessionLocal()
        # Get uploader_id from form (must be citizens.id)
        uploader_id = request.form.get('uploader_id')
        if not uploader_id or not session.query(Citizens).filter_by(id=uploader_id).first():
            session.close()
            return jsonify({'success': False, 'error': 'Invalid uploader_id'}), 400
        category = request.form.get('category')
        description = request.form.get('description')
        latitude = request.form.get('latitude')
        longitude = request.form.get('longitude')
        media = request.files.get('media')

        # Save media file if present
        media_path = None
        if media:
            upload_folder = os.path.join(os.getcwd(), 'uploads')
            os.makedirs(upload_folder, exist_ok=True)
            filename = secure_filename(media.filename)
            media_path = filename  # Only store filename
            media.save(os.path.join(upload_folder, filename))

        # Generate a unique id for both SQL and MongoDB
        last_report = Mongo_Uploads.objects.order_by('-id').first()
        next_id = (last_report.id + 1) if last_report else 1

        # Save to MongoDB
        mongo_report = Mongo_Uploads(
            id=next_id,
            image_path=f"/uploads/{media_path}" if media and media.mimetype.startswith('image') else None,
            video_path=f"/uploads/{media_path}" if media and media.mimetype.startswith('video') else None,
            description=description,
            issue_category=category,
            issue_predicted_category=['manual'],
        )
        mongo_report.save()

        # Save to SQL
        upload = Uploads(
            id=str(next_id),
            uploader_id=int(uploader_id),
            issue_date=date.today(),
            issue_latitude=float(latitude) if latitude else None,
            issue_longitude=float(longitude) if longitude else None,
            issue_nearby_uploader=False,  # Set as needed
            uploader_date=date.today(),
            uploaders_pincode="000000",  # Set as needed
            nearby_NGO=None
        )
        session.add(upload)
        session.commit()
        session.close()

        return jsonify({'success': True, 'message': 'Report submitted successfully.'}), 201
    except Exception as e:
        return jsonify({'success': False, 'error': str(e)}), 500



if __name__ == '__main__':
    app.run(debug=True)
