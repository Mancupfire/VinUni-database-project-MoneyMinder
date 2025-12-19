import unittest
from unittest.mock import patch
from app import create_app


class AppSmokeTests(unittest.TestCase):
    def setUp(self):
        self.app = create_app('development')
        self.app.config['TESTING'] = True
        self.client = self.app.test_client()

    @patch('app.Database.test_connection', return_value=True)
    def test_health_returns_connected_status(self, _mock_db):
        response = self.client.get('/api/health')
        self.assertEqual(response.status_code, 200)
        data = response.get_json()
        self.assertEqual(data['status'], 'healthy')
        self.assertEqual(data['database'], 'connected')
        self.assertIn('version', data)

    def test_root_endpoint_lists_endpoints(self):
        response = self.client.get('/')
        self.assertEqual(response.status_code, 200)
        data = response.get_json()
        self.assertEqual(data['message'], 'MoneyMinder API')
        self.assertIn('endpoints', data)


if __name__ == '__main__':
    unittest.main()
