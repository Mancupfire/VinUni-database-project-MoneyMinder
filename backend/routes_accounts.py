"""
Account management routes
"""
from flask import Blueprint, request, jsonify
from database import Database
from auth import require_auth

accounts_bp = Blueprint('accounts', __name__, url_prefix='/api/accounts')

@accounts_bp.route('/', methods=['GET'])
@require_auth
def get_accounts():
    """Get all accounts for current user"""
    try:
        accounts = Database.execute_query(
            """
            SELECT account_id, account_name, account_type, balance, created_at
            FROM Accounts
            WHERE user_id = %s
            ORDER BY created_at DESC
            """,
            (request.user_id,),
            fetch_all=True
        )
        
        return jsonify({'accounts': accounts}), 200
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@accounts_bp.route('/<int:account_id>', methods=['GET'])
@require_auth
def get_account(account_id):
    """Get specific account"""
    try:
        account = Database.execute_query(
            """
            SELECT account_id, account_name, account_type, balance, created_at
            FROM Accounts
            WHERE account_id = %s AND user_id = %s
            """,
            (account_id, request.user_id),
            fetch_one=True
        )
        
        if not account:
            return jsonify({'error': 'Account not found'}), 404
        
        return jsonify({'account': account}), 200
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@accounts_bp.route('/', methods=['POST'])
@require_auth
def create_account():
    """Create new account"""
    try:
        data = request.get_json()
        
        # Validate required fields
        required_fields = ['account_name', 'account_type']
        if not all(field in data for field in required_fields):
            return jsonify({'error': 'Missing required fields'}), 400
        
        # Validate account_type
        valid_types = ['Cash', 'Bank Account', 'Credit Card', 'E-Wallet', 'Investment']
        if data['account_type'] not in valid_types:
            return jsonify({'error': 'Invalid account type'}), 400
        
        # Insert account
        account_id = Database.execute_query(
            """
            INSERT INTO Accounts (user_id, account_name, account_type, balance)
            VALUES (%s, %s, %s, %s)
            """,
            (request.user_id, data['account_name'], data['account_type'], data.get('balance', 0)),
            commit=True
        )
        
        return jsonify({
            'message': 'Account created successfully',
            'account_id': account_id
        }), 201
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@accounts_bp.route('/<int:account_id>', methods=['PUT'])
@require_auth
def update_account(account_id):
    """Update account"""
    try:
        data = request.get_json()
        
        # Check if account belongs to user
        account = Database.execute_query(
            "SELECT account_id FROM Accounts WHERE account_id = %s AND user_id = %s",
            (account_id, request.user_id),
            fetch_one=True
        )
        
        if not account:
            return jsonify({'error': 'Account not found'}), 404
        
        # Build update query
        update_fields = []
        params = []
        
        if 'account_name' in data:
            update_fields.append("account_name = %s")
            params.append(data['account_name'])
        
        if 'account_type' in data:
            valid_types = ['Cash', 'Bank Account', 'Credit Card', 'E-Wallet', 'Investment']
            if data['account_type'] not in valid_types:
                return jsonify({'error': 'Invalid account type'}), 400
            update_fields.append("account_type = %s")
            params.append(data['account_type'])
        
        if not update_fields:
            return jsonify({'error': 'No fields to update'}), 400
        
        params.extend([account_id, request.user_id])
        
        Database.execute_query(
            f"UPDATE Accounts SET {', '.join(update_fields)} WHERE account_id = %s AND user_id = %s",
            tuple(params),
            commit=True
        )
        
        return jsonify({'message': 'Account updated successfully'}), 200
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@accounts_bp.route('/<int:account_id>', methods=['DELETE'])
@require_auth
def delete_account(account_id):
    """Delete account"""
    try:
        # Check if account belongs to user
        account = Database.execute_query(
            "SELECT account_id FROM Accounts WHERE account_id = %s AND user_id = %s",
            (account_id, request.user_id),
            fetch_one=True
        )
        
        if not account:
            return jsonify({'error': 'Account not found'}), 404
        
        Database.execute_query(
            "DELETE FROM Accounts WHERE account_id = %s AND user_id = %s",
            (account_id, request.user_id),
            commit=True
        )
        
        return jsonify({'message': 'Account deleted successfully'}), 200
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@accounts_bp.route('/summary', methods=['GET'])
@require_auth
def get_accounts_summary():
    """Get summary of all accounts"""
    try:
        summary = Database.execute_query(
            """
            SELECT 
                COUNT(*) as total_accounts,
                SUM(balance) as total_balance,
                account_type,
                SUM(balance) as type_balance
            FROM Accounts
            WHERE user_id = %s
            GROUP BY account_type
            """,
            (request.user_id,),
            fetch_all=True
        )
        
        total = Database.execute_query(
            """
            SELECT 
                COUNT(*) as total_accounts,
                SUM(balance) as total_balance
            FROM Accounts
            WHERE user_id = %s
            """,
            (request.user_id,),
            fetch_one=True
        )
        
        return jsonify({
            'summary': {
                'total_accounts': total['total_accounts'] or 0,
                'total_balance': float(total['total_balance'] or 0),
                'by_type': summary
            }
        }), 200
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500
