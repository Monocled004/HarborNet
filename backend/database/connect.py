from sqlalchemy import create_engine
from sqlalchemy.orm import declarative_base, sessionmaker
from mongoengine import connect



USERNAME = 'harbornet_user'
PASSWORD = 'your_secure_password'
HOST = 'localhost'
DB_NAME = 'harbornet'


# Detect Fedora and use MariaDB, else use MySQL
def get_sqlalchemy_url():
    try:
        with open('/etc/os-release') as f:
            os_release = f.read().lower()
        if 'fedora' in os_release:
            # Use MariaDB connector
            return f'mariadb+mariadbconnector://{USERNAME}:{PASSWORD}@{HOST}/{DB_NAME}'
    except Exception:
        pass
    # Default to MySQL
    return f'mysql+mysqlconnector://{USERNAME}:{PASSWORD}@{HOST}/{DB_NAME}'

engine = create_engine(
    get_sqlalchemy_url(),
    pool_size=10,           # Increase the pool size
    max_overflow=20,        # Allow up to 20 additional connections
    pool_timeout=30,        # Keep the timeout at 30 seconds or adjust as needed
)


Base = declarative_base()
SessionLocal = sessionmaker(bind=engine)



''' for mongodb '''
def init_db():
    """
    Initialize connection to MongoDB.
    Change db name, host, port, and authentication as needed.
    """
    connect(
        db="harbornet",       # database name
        host="localhost",    # MongoDB server
        port=27017         # default MongoDB port
        # username="your_username",  # uncomment when set authentication
        # password="your_password",
    )

init_db()
