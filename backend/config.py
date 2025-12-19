"""
Configuration settings for MoneyMinder backend
"""
import os
from dotenv import load_dotenv

load_dotenv()

class Config:
    """Base configuration"""
    SECRET_KEY = os.getenv('SECRET_KEY', 'dev-secret-key-please-change')
    JWT_SECRET_KEY = os.getenv('JWT_SECRET_KEY', 'dev-jwt-secret-key-please-change')
    
    # Database configuration
    DB_CONFIG = {
        'host': os.getenv('DB_HOST', 'localhost'),
        'user': os.getenv('DB_USER', 'moneyminder_app'),
        'password': os.getenv('DB_PASSWORD', 'App@2024Secure!'),
        'database': os.getenv('DB_NAME', 'MoneyMinder_DB'),
        'port': int(os.getenv('DB_PORT', 3306)),
        'charset': 'utf8mb4'
    }
    
    # Flask configuration
    # Default to non-debug unless explicitly enabled
    DEBUG = os.getenv('FLASK_DEBUG', 'False') == 'True'
    TESTING = False
    FRONTEND_ORIGINS = [
        origin.strip()
        for origin in os.getenv('FRONTEND_ORIGIN', 'http://localhost:8080').split(',')
        if origin.strip()
    ]
    
    # Server configuration
    HOST = os.getenv('HOST', '0.0.0.0')
    PORT = int(os.getenv('PORT', 5000))
    
    # JWT configuration
    JWT_EXPIRATION_HOURS = 24

class DevelopmentConfig(Config):
    """Development configuration"""
    # Keep the debug flag configurable via environment instead of forcing True
    DEBUG = Config.DEBUG
    TESTING = False

class ProductionConfig(Config):
    """Production configuration"""
    DEBUG = False
    TESTING = False

# Config dictionary
config = {
    'development': DevelopmentConfig,
    'production': ProductionConfig,
    'default': DevelopmentConfig
}
