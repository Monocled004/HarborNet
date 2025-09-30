from sqlalchemy import and_, or_
from database.connect import SessionLocal
from database.db_models import Citizens, Employees, Volunteers, NGO, Uploads, Mongo_Uploads




'''FOR EMPLOYEES TABLE'''

# to check if the citizens identifier exist and returns id
def check_user(identifier=None):
    if not identifier:
        print("check_user caused error: Provide email or phone to login.")
        return None

    session = SessionLocal()
    try:
        # Check if identifier is email or phone
        user = session.query(Citizens).filter(
            (Citizens.email == identifier) | (Citizens.mobile == identifier)
        ).first()

        if user:
            return user.id
        else:
            return None

    except Exception as e:
        print(f"check_user caused error: {e}\n")
        return False

    finally:
        session.close()

# to verify the citizen and password
def verify_user(identifier=None, password=None):
    if not identifier:
        print("verify_user caused error: Provide email or phone to login.")
        return False

    if not password:
        print("verify_user caused error: Password is required.")
        return False

    session = SessionLocal()
    try:
        # Check if identifier is email or phone
        user = session.query(Citizens).filter(
            (Citizens.email == identifier) | (Citizens.mobile == identifier)
        ).first()

        if not user:
            print("verify_user caused error: User not found.")
            return False

        # Verify password
        if user.password != password:
            print("verify_user caused error: Incorrect password.")
            return False

        print("Login successful!")
        return True

    except Exception as e:
        print(f"verify_user caused error: {e}")
        return False

    finally:
        session.close()

# to add new user
def add_new_user(phone=None, email=None, password=None):
    if not (phone or email):
        print("add_new_user caused problem: Provide at least email or phone.")
        return

    if not password:
        print("add_new_user caused problem: Password is required.")
        return

    session = SessionLocal()
    try:
        # Check if the user already exists
        query = session.query(Citizens)
        if phone:
            if query.filter(Citizens.mobile == phone).first():
                print("add_new_user caused problem: Phone number already registered.")
                return
        if email:
            if query.filter(Citizens.email == email).first():
                print("add_new_user caused problem: Email already registered.")
                return

        # Create new account
        user = Citizens(mobile=phone, email=email, password=password)
        session.add(user)
        session.commit()
        print("User created successfully!")

    except Exception as e:
        session.rollback()
        print(f"add_new_user caused problem: {e}")

    finally:
        session.close()

# to delete the user
def delete_user(identifier=None, password=None):
    pass





'''FOR EMPLOYEE TABLE'''

# to check if the employee identifier already exist
def check_employee(email=None):
    if not email:
        print("check_employee caused error: Provide email to login.")
        return None

    session = SessionLocal()
    try:
        # Check if identifier is email or phone
        user = session.query(Employees).filter(
            (Employees.email == email)
        ).first()

        if user:
            return user.id
        else:
            return None

    except Exception as e:
        print(f"check_employee caused error: {e}\n")
        return False

    finally:
        session.close()

# to verify the user and password
def verify_employee(email=None, password=None):
    if not email:
        print("verify_employee caused error: Provide email or phone to login.")
        return False

    if not password:
        print("verify_employee caused error: Password is required.")
        return False

    session = SessionLocal()
    try:
        # Check if identifier is email or phone
        user = session.query(Employees).filter(
            (Employees.email == email)
        ).first()

        if not user:
            print("verify_employee caused error: User not found.")
            return False

        # Verify password
        if user.password != password:
            print("verify_employee caused error: Incorrect password.")
            return False

        print("Login successful!")
        return True

    except Exception as e:
        print(f"verify_employee caused error: {e}")
        return False

    finally:
        session.close()

# to add new employee details
def add_new_employee(email=None, password=None):
    if not email:
        print("add_new_employee caused problem: Provide at least email or phone.")
        return

    if not password:
        print("add_new_employee caused problem: Password is required.")
        return

    session = SessionLocal()
    try:
        # Check if the user already exists
        query = session.query(Employees)
        if email:
            if query.filter(Employees.email == email).first():
                print("add_new_employee caused problem: Email already registered.")
                return

        # Create new account
        user = Employees(email=email, password=password)
        session.add(user)
        session.commit()

    except Exception as e:
        session.rollback()
        print(f"add_new_employee caused problem: {e}")

    finally:
        session.close()

# to delete the employee
def delete_employee(email=None, password=None):
    pass





'''FOR VOLUNTEER TABLE'''

# to check if the volunteer identifier already exist
def check_volunteer(email=None, contact=None):
    if not email:
        print("check_volunteer caused error: Provide email or phone to login.")
        return None

    session = SessionLocal()
    try:
        # Check if identifier is email or phone
        user = session.query(Volunteers).filter(
            (Volunteers.email == email)
        ).first()

        if user:
            return user.id
        else:
            return None

    except Exception as e:
        print(f"check_volunteer caused error: {e}\n")
        return False

    finally:
        session.close()

# to verify the user and password
def verify_volunteer(email=None, password=None):
    if not email:
        print("verify_volunteer caused error: Provide email or phone to login.")
        return False

    if not password:
        print("verify_volunteer caused error: Password is required.")
        return False

    session = SessionLocal()
    try:
        # Check if identifier is email or phone
        user = session.query(Volunteers).filter(
            (Citizens.email == email)
        ).first()

        if not user:
            print("verify_volunteer caused error: User not found.")
            return False

        # Verify password
        if user.password != password:
            print("verify_volunteer caused error: Incorrect password.")
            return False

        print("Login successful!")
        return True

    except Exception as e:
        print(f"verify_volunteer caused error: {e}")
        return False

    finally:
        session.close()

# to add new volunteer details
def add_new_volunteer(email=None, password=None, contact=None, at_NGO=None):
    if not email:
        print("add_new_volunteer caused problem: Provide at least email or phone.")
        return

    if not password:
        print("add_new_volunteer caused problem: Password is required.")
        return
    
    if not contact:
        print("add_new_volunteer caused problem: Contact is required.")
        return

    session = SessionLocal()
    try:
        # Check if the user already exists
        query = session.query(Volunteers)
        if email:
            if query.filter(Volunteers.email == email).first():
                print("add_new_volunteer caused problem: Email already registered.")
                return

        # Create new account
        user = Employees(email=email, password=password, contact=contact, at_NGO=at_NGO)
        session.add(user)
        session.commit()

    except Exception as e:
        session.rollback()
        print(f"add_new_volunteer caused problem: {e}")

    finally:
        session.close()

# to delete the volunteer
def delete_volunteer(email=None, password=None):
    pass





'''FOR NGO TABLE'''

# to check if the user ngo already exist
def check_ngo(name=None):
    if not name:
        print("check_ngo caused error: Provide email or phone to login.")
        return None
    
    session = SessionLocal()
    
    try:
        # Check if identifier is email or phone
        user = session.query(NGO).filter(
            (NGO.name == name)
        ).first()

        if user:
            return user.id
        else:
            return None

    except Exception as e:
        print(f"check_ngo caused error: {e}\n")
        return False

    finally:
        session.close()

# to add new ngo
def add_new_ngo(name=None, email=None, pincode=None, contact_1=None):
    
    if not name:
        print("add_new_ngo caused problem: Name is required.")
        return
    
    if not pincode:
        print('add_new_ngo caused error: Pincode is necessary')

    if not contact_1:
        print("add_new_ngo caused problem: Contact is required.")
        return

    session = SessionLocal()
    try:
        # Check if the user already exists
        query = session.query(NGO)
        if email:
            if query.filter((NGO.email == email) & (NGO.name == name)).first():
                print("add_new_ngo caused problem: Email already registered.")
                return

        # Create new account
        user = NGO(name=name, email=email, pincode=pincode, contact_1=contact_1)
        session.add(user)
        session.commit()

    except Exception as e:
        session.rollback()
        print(f"add_new_ngo caused problem: {e}")

    finally:
        session.close()

# to delete the ngo
def delete_ngo(name=None, password=None):
    pass





'''FOR UPLOADS'''

# to get the id of complaint based on filters
def get_id(location=None, issue=None, date=None, source=None):
    pass

# to get all complaints
def get_all_uploads():
    '''
    this will return sql and mongo objects
    '''
    pass

# to get specified complaints
def get_uploads(location=None, issue=None, date=None, source=None):
    '''
    this will return sql and mongo objects'''
    pass

def new_uploads(id=None, uploader=None, issue_date=None, issue_location=None, issue_longitude=None, issue_nearby_uploader=None, nearby_NGO=None, image_path=None, video_path=None, issue_category=None, issue_predicted_category=None, uploader_date=None, uploader_pincode=None):
    
    if not id:
        print("new_uploads caused problem: Id generated")
        return

    if not uploader:
        print("new_uploads caused problem: Uploader name")
        return
    
    if not uploader_date:
        print("add_new_volunteer caused problem: Contact is required.")
        return
    
    if not uploader_date:
        print("new_uploads caused error: Uploader date problem")
        return 
    
    if not uploader_pincode:
        print("new_uploads caused error: uploder pincode is null")
        return 
    
    if not nearby_NGO:
        print('new_uploads caused error: nearby_NGO')
        return 

    session = SessionLocal()
    try:
        # Check if the user already exists
        query = session.query(Uploads)
        if id:
            if query.filter(Uploads.id == id).first():
                print("new_uploads caused problem: id already exist.")
                return

        # Create new account
        upload = Uploads(id=id, uploader=uploader, issue_date=issue_date, issue_location=issue_location, issue_longitude=issue_longitude, issue_nearby_uploader=issue_nearby_uploader, nearby_NGO=nearby_NGO, image_path=image_path, video_path=video_path, issue_category=issue_category, issue_predicted_category=issue_predicted_category, uploader_date=uploader_date, uploader_pincode=uploader_pincode)
        session.add(upload)
        session.commit()

    except Exception as e:
        session.rollback()
        print(f"new_upload caused problem: {e}")

    finally:
        session.close()

#