import requests
import sys
import json
from datetime import datetime

class CONERAPITester:
    def __init__(self, base_url="http://localhost:8000/api"):
        self.base_url = base_url
        self.token = None
        self.tests_run = 0
        self.tests_passed = 0
        self.admin_username = f"test_admin_{datetime.now().strftime('%H%M%S')}"
        self.admin_password = "TestAdmin123!"

    def run_test(self, name, method, endpoint, expected_status, data=None, headers=None):
        """Run a single API test"""
        url = f"{self.base_url}/{endpoint}" if endpoint else self.base_url
        test_headers = {'Content-Type': 'application/json'}
        
        if headers:
            test_headers.update(headers)
        
        if self.token:
            test_headers['Authorization'] = f'Bearer {self.token}'

        self.tests_run += 1
        print(f"\n🔍 Testing {name}...")
        print(f"   URL: {url}")
        
        try:
            if method == 'GET':
                response = requests.get(url, headers=test_headers, timeout=30)
            elif method == 'POST':
                response = requests.post(url, json=data, headers=test_headers, timeout=30)
            elif method == 'PUT':
                response = requests.put(url, json=data, headers=test_headers, timeout=30)

            success = response.status_code == expected_status
            if success:
                self.tests_passed += 1
                print(f"✅ Passed - Status: {response.status_code}")
                try:
                    response_data = response.json()
                    print(f"   Response: {json.dumps(response_data, indent=2)[:200]}...")
                except:
                    print(f"   Response: {response.text[:100]}...")
            else:
                print(f"❌ Failed - Expected {expected_status}, got {response.status_code}")
                try:
                    error_data = response.json()
                    print(f"   Error: {json.dumps(error_data, indent=2)}")
                except:
                    print(f"   Error: {response.text}")

            return success, response.json() if response.headers.get('content-type', '').startswith('application/json') else {}

        except requests.exceptions.Timeout:
            print(f"❌ Failed - Request timeout")
            return False, {}
        except Exception as e:
            print(f"❌ Failed - Error: {str(e)}")
            return False, {}

    def test_root_endpoint(self):
        """Test the root API endpoint"""
        success, response = self.run_test(
            "Root API Endpoint",
            "GET",
            "",
            200
        )
        return success

    def test_admin_check_setup(self):
        """Check if admin setup is needed"""
        success, response = self.run_test(
            "Check Admin Setup",
            "GET",
            "admin/check-setup",
            200
        )
        if success:
            self.admin_exists = response.get('admin_exists', False)
            print(f"   Admin exists: {self.admin_exists}")
        return success

    def test_admin_setup(self):
        """Create admin user if needed"""
        if hasattr(self, 'admin_exists') and self.admin_exists:
            print("\n🔍 Testing Admin Setup...")
            print("✅ Skipped - Admin already exists")
            self.tests_run += 1
            self.tests_passed += 1
            return True
            
        success, response = self.run_test(
            "Admin Setup",
            "POST",
            "admin/setup",
            200,
            data={"username": self.admin_username, "password": self.admin_password}
        )
        return success

    def test_admin_login(self):
        """Test admin login"""
        # Use existing admin if available, otherwise use the one we created
        username = "admin" if hasattr(self, 'admin_exists') and self.admin_exists else self.admin_username
        password = "admin123" if hasattr(self, 'admin_exists') and self.admin_exists else self.admin_password
        
        success, response = self.run_test(
            "Admin Login",
            "POST",
            "admin/login",
            200,
            data={"username": username, "password": password}
        )
        
        if not success and hasattr(self, 'admin_exists') and self.admin_exists:
            # Try with our test credentials
            success, response = self.run_test(
                "Admin Login (with test credentials)",
                "POST",
                "admin/login",
                200,
                data={"username": self.admin_username, "password": self.admin_password}
            )
        
        if success and 'access_token' in response:
            self.token = response['access_token']
            print(f"   Token obtained: {self.token[:20]}...")
            return True
        return False

    def test_admin_config_get(self):
        """Test getting admin configuration"""
        if not self.token:
            print("\n🔍 Testing Get Admin Config...")
            print("❌ Failed - No authentication token")
            self.tests_run += 1
            return False
            
        success, response = self.run_test(
            "Get Admin Config",
            "GET",
            "admin/config",
            200
        )
        return success

    def test_admin_config_update(self):
        """Test updating admin configuration"""
        if not self.token:
            print("\n🔍 Testing Update Admin Config...")
            print("❌ Failed - No authentication token")
            self.tests_run += 1
            return False
            
        success, response = self.run_test(
            "Update Admin Config",
            "PUT",
            "admin/config",
            200,
            data={
                "api_url": "http://synkdata.online/v1/imss/historial-laboral",
                "api_key": "test-api-key-12345",
                "timeout_seconds": 30
            }
        )
        return success

    def test_admin_stats(self):
        """Test getting admin statistics"""
        if not self.token:
            print("\n🔍 Testing Admin Stats...")
            print("❌ Failed - No authentication token")
            self.tests_run += 1
            return False
            
        success, response = self.run_test(
            "Get Admin Stats",
            "GET",
            "admin/stats",
            200
        )
        return success

    def test_historial_laboral_invalid_curp(self):
        """Test historial laboral with invalid CURP"""
        success, response = self.run_test(
            "Historial Laboral - Invalid CURP (too short)",
            "POST",
            "historial-laboral",
            400,
            data={"curp": "INVALID"}
        )
        return success

    def test_historial_laboral_valid_curp(self):
        """Test historial laboral with valid CURP format"""
        # Using a valid CURP format (may not exist in real system)
        test_curp = "ABCD123456HDFGHI01"
        success, response = self.run_test(
            "Historial Laboral - Valid CURP Format",
            "POST",
            "historial-laboral",
            200,  # Expecting 200 even if no data found
            data={"curp": test_curp}
        )
        
        # The API might return success with error status in response body
        if success and response.get('status') == 'error':
            print(f"   API returned error as expected: {response.get('message', 'Unknown error')}")
        
        return success

    def test_historial_laboral_with_nss(self):
        """Test historial laboral with CURP and NSS"""
        test_curp = "ABCD123456HDFGHI01"
        test_nss = "12345678901"
        success, response = self.run_test(
            "Historial Laboral - With NSS",
            "POST",
            "historial-laboral",
            200,
            data={"curp": test_curp, "nss": test_nss}
        )
        return success

def main():
    print("🚀 Starting CONER API Tests...")
    print("=" * 50)
    
    # Setup
    tester = CONERAPITester()
    
    # Run tests in order
    tests = [
        tester.test_root_endpoint,
        tester.test_admin_check_setup,
        tester.test_admin_setup,
        tester.test_admin_login,
        tester.test_admin_config_get,
        tester.test_admin_config_update,
        tester.test_admin_stats,
        tester.test_historial_laboral_invalid_curp,
        tester.test_historial_laboral_valid_curp,
        tester.test_historial_laboral_with_nss,
    ]
    
    for test in tests:
        try:
            test()
        except Exception as e:
            print(f"❌ Test {test.__name__} failed with exception: {str(e)}")
            tester.tests_run += 1

    # Print results
    print("\n" + "=" * 50)
    print(f"📊 Test Results: {tester.tests_passed}/{tester.tests_run} passed")
    
    if tester.tests_passed == tester.tests_run:
        print("🎉 All tests passed!")
        return 0
    else:
        print(f"⚠️  {tester.tests_run - tester.tests_passed} tests failed")
        return 1

if __name__ == "__main__":
    sys.exit(main())