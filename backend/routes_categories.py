"""
Categories management routes
"""
from flask import Blueprint, request, jsonify
from database import Database
from auth import require_auth

categories_bp = Blueprint('categories', __name__, url_prefix='/api/categories')

@categories_bp.route('/', methods=['GET'])
@require_auth
def get_categories():
    """Get all categories (system default + user custom)"""
    try:
        categories = Database.execute_query(
            """
            SELECT category_id, category_name, type, 
                   CASE WHEN user_id IS NULL THEN 'System' ELSE 'Custom' END as source
            FROM Categories
            WHERE user_id IS NULL OR user_id = %s
            ORDER BY type, category_name
            """,
            (request.user_id,),
            fetch_all=True
        )
        
        return jsonify({'categories': categories}), 200
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@categories_bp.route('/<int:category_id>', methods=['GET'])
@require_auth
def get_category(category_id):
    """Get specific category"""
    try:
        category = Database.execute_query(
            """
            SELECT category_id, category_name, type, user_id
            FROM Categories
            WHERE category_id = %s AND (user_id IS NULL OR user_id = %s)
            """,
            (category_id, request.user_id),
            fetch_one=True
        )
        
        if not category:
            return jsonify({'error': 'Category not found'}), 404
        
        return jsonify({'category': category}), 200
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@categories_bp.route('/', methods=['POST'])
@require_auth
def create_category():
    """Create custom category"""
    try:
        data = request.get_json()
        
        # Validate required fields
        if not data.get('category_name') or not data.get('type'):
            return jsonify({'error': 'Category name and type required'}), 400
        
        # Validate type
        if data['type'] not in ['Income', 'Expense']:
            return jsonify({'error': 'Type must be Income or Expense'}), 400
        
        # Insert category
        category_id = Database.execute_query(
            """
            INSERT INTO Categories (user_id, category_name, type)
            VALUES (%s, %s, %s)
            """,
            (request.user_id, data['category_name'], data['type']),
            commit=True
        )
        
        return jsonify({
            'message': 'Category created successfully',
            'category_id': category_id
        }), 201
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@categories_bp.route('/<int:category_id>', methods=['PUT'])
@require_auth
def update_category(category_id):
    """Update custom category (only user's own categories)"""
    try:
        data = request.get_json()
        
        # Check if category belongs to user (not system category)
        category = Database.execute_query(
            "SELECT category_id FROM Categories WHERE category_id = %s AND user_id = %s",
            (category_id, request.user_id),
            fetch_one=True
        )
        
        if not category:
            return jsonify({'error': 'Category not found or cannot be modified'}), 404
        
        # Build update query
        update_fields = []
        params = []
        
        if 'category_name' in data:
            update_fields.append("category_name = %s")
            params.append(data['category_name'])
        
        if 'type' in data:
            if data['type'] not in ['Income', 'Expense']:
                return jsonify({'error': 'Type must be Income or Expense'}), 400
            update_fields.append("type = %s")
            params.append(data['type'])
        
        if not update_fields:
            return jsonify({'error': 'No fields to update'}), 400
        
        params.extend([category_id, request.user_id])
        
        Database.execute_query(
            f"UPDATE Categories SET {', '.join(update_fields)} WHERE category_id = %s AND user_id = %s",
            tuple(params),
            commit=True
        )
        
        return jsonify({'message': 'Category updated successfully'}), 200
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@categories_bp.route('/<int:category_id>', methods=['DELETE'])
@require_auth
def delete_category(category_id):
    """Delete custom category (only user's own categories)"""
    try:
        # Check if category belongs to user (not system category)
        category = Database.execute_query(
            "SELECT category_id FROM Categories WHERE category_id = %s AND user_id = %s",
            (category_id, request.user_id),
            fetch_one=True
        )
        
        if not category:
            return jsonify({'error': 'Category not found or cannot be deleted'}), 404
        
        Database.execute_query(
            "DELETE FROM Categories WHERE category_id = %s AND user_id = %s",
            (category_id, request.user_id),
            commit=True
        )
        
        return jsonify({'message': 'Category deleted successfully'}), 200
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500
