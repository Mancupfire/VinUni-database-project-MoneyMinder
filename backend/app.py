"""
MoneyMinder Backend API
Flask application entry point
"""
import os
import time
from flask import Flask, jsonify, request, g
from flask_cors import CORS
from flask_limiter import Limiter
from flask_limiter.util import get_remote_address
from config import config
from database import Database

# Import route blueprints
from routes_auth import auth_bp
from routes_accounts import accounts_bp
from routes_transactions import transactions_bp
from routes_categories import categories_bp
from routes_analytics import analytics_bp
from routes_budgets import budgets_bp
from routes_groups import groups_bp
from routes_recurring import recurring_bp

def warn_insecure_settings(app):
    """Log warnings for insecure defaults to nudge operators to rotate secrets."""
    warnings = []
    if 'please-change' in app.config.get('SECRET_KEY', ''):
        warnings.append("SECRET_KEY is using the placeholder value; update backend/.env.")
    if 'please-change' in app.config.get('JWT_SECRET_KEY', ''):
        warnings.append("JWT_SECRET_KEY is using the placeholder value; update backend/.env.")
    db_password = config['default'].DB_CONFIG.get('password')
    if db_password == 'App@2024Secure!':
        warnings.append("DB_PASSWORD is still the default; rotate to your real credentials.")
    if app.config.get('DEBUG'):
        warnings.append("FLASK_DEBUG=True; disable in production.")
    
    for message in warnings:
        app.logger.warning(message)
        print(f"[config warning] {message}")

def validate_required_settings(app):
    """
    Fail fast on unsafe defaults when explicitly requested via env flag.
    Enable by setting ENFORCE_STRICT_CONFIG=True to prevent accidental prod misconfig.
    """
    if app.config.get('TESTING'):
        return
    enforce = (
        os.getenv('ENFORCE_STRICT_CONFIG', 'False') == 'True'
        or bool(app.config.get('ENFORCE_STRICT_CONFIG'))
        or (app.config.get('ENV') == 'production' and not app.config.get('DEBUG'))
    )
    if not enforce:
        return
    
    errors = []
    if 'please-change' in app.config.get('SECRET_KEY', ''):
        errors.append("SECRET_KEY must be set to a non-placeholder value.")
    if 'please-change' in app.config.get('JWT_SECRET_KEY', ''):
        errors.append("JWT_SECRET_KEY must be set to a non-placeholder value.")
    if config['default'].DB_CONFIG.get('password') == 'App@2024Secure!':
        errors.append("DB_PASSWORD must be rotated from the default.")
    
    if errors:
        raise RuntimeError("Configuration validation failed:\n- " + "\n- ".join(errors))

def create_app(config_name='development'):
    """Application factory"""
    app = Flask(__name__)
    app.config.from_object(config[config_name])
    warn_insecure_settings(app)
    app.config['ENFORCE_STRICT_CONFIG'] = os.getenv('ENFORCE_STRICT_CONFIG', 'False') == 'True'
    
    # Basic rate limiting (in-memory) to protect auth and public endpoints
    limiter = Limiter(
        key_func=get_remote_address,
        default_limits=["500 per hour"],
        storage_uri="memory://"
    )
    limiter.init_app(app)
    
    # Disable strict slashes to avoid redirect issues
    app.url_map.strict_slashes = False
    
    # Enable CORS
    CORS(app, resources={
        r"/api/*": {
            "origins": app.config.get('FRONTEND_ORIGINS', ['http://localhost:8080']),
            "methods": ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
            "allow_headers": ["Content-Type", "Authorization"]
        }
    })

    @app.before_request
    def _start_timer():
        g.request_start_time = time.time()
        g.request_id = request.headers.get('X-Request-ID')
        validate_required_settings(app)

    @app.after_request
    def _add_security_headers(response):
        response.headers.setdefault('X-Content-Type-Options', 'nosniff')
        response.headers.setdefault('X-Frame-Options', 'DENY')
        response.headers.setdefault('Referrer-Policy', 'no-referrer')
        response.headers.setdefault('Strict-Transport-Security', 'max-age=63072000; includeSubDomains')
        # Lightweight request log
        start = getattr(g, 'request_start_time', None)
        duration_ms = int((time.time() - start) * 1000) if start else None
        app.logger.info(
            "%s %s -> %s%s",
            request.method,
            request.path,
            response.status_code,
            f" ({duration_ms}ms)" if duration_ms is not None else ""
        )
        return response
    
    # Register blueprints
    app.register_blueprint(auth_bp)
    app.register_blueprint(accounts_bp)
    app.register_blueprint(transactions_bp)
    app.register_blueprint(categories_bp)
    app.register_blueprint(analytics_bp)
    app.register_blueprint(budgets_bp)
    app.register_blueprint(groups_bp)
    app.register_blueprint(recurring_bp)
    
    # Health check endpoint
    @app.route('/api/health', methods=['GET'])
    def health_check():
        """Health check endpoint"""
        db_status = Database.test_connection()
        return jsonify({
            'status': 'healthy' if db_status else 'unhealthy',
            'database': 'connected' if db_status else 'disconnected',
            'version': '1.0.0'
        }), 200 if db_status else 503
    
    # Root endpoint
    @app.route('/', methods=['GET'])
    def root():
        """Root endpoint"""
        return jsonify({
            'message': 'MoneyMinder API',
            'version': '1.0.0',
            'endpoints': {
                'health': '/api/health',
                'auth': '/api/auth',
                'accounts': '/api/accounts',
                'transactions': '/api/transactions',
                'categories': '/api/categories',
                'analytics': '/api/analytics',
                'budgets': '/api/budgets',
                'groups': '/api/groups',
                'recurring': '/api/recurring'
            }
        }), 200
    
    # Error handlers
    @app.errorhandler(404)
    def not_found(error):
        return jsonify({'error': 'Endpoint not found'}), 404
    
    @app.errorhandler(500)
    def internal_error(error):
        return jsonify({'error': 'Internal server error'}), 500
    
    return app

if __name__ == '__main__':
    app = create_app()
    print("=" * 60)
    print("MoneyMinder Backend API Starting...")
    print(f"Environment: {app.config.get('ENV', 'development')}")
    print(f"Debug Mode: {app.config.get('DEBUG', False)}")
    print(f"Host: {app.config['HOST']}")
    print(f"Port: {app.config['PORT']}")
    print("=" * 60)
    
    # Test database connection
    if Database.test_connection():
        print("✓ Database connection successful!")
    else:
        print("✗ Database connection failed! Check your configuration.")
    
    print("=" * 60)
    print("API Documentation:")
    print("  POST   /api/auth/register      - Register new user")
    print("  POST   /api/auth/login         - Login user")
    print("  GET    /api/auth/me            - Get current user")
    print("  GET    /api/accounts           - List accounts")
    print("  POST   /api/accounts           - Create account")
    print("  GET    /api/transactions       - List transactions")
    print("  POST   /api/transactions       - Create transaction")
    print("  GET    /api/categories         - List categories")
    print("  GET    /api/analytics/dashboard - Get dashboard data")
    print("=" * 60)
    
    app.run(
        host=app.config['HOST'],
        port=app.config['PORT'],
        debug=app.config['DEBUG']
    )
