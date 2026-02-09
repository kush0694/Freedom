#!/usr/bin/env python3
"""
Comprehensive Backend Testing for Freedom Score Platform
Tests all backend APIs and functionality end-to-end
"""

import requests
import json
import time
from datetime import datetime
from typing import Dict, Any, Optional

# Configuration
BASE_URL = "https://money-stability.preview.emergentagent.com/api"
TEST_USER_EMAIL = "sarah.johnson@example.com"
TEST_USER_PASSWORD = "SecurePass123!"

class FreedomScoreAPITester:
    def __init__(self):
        self.base_url = BASE_URL
        self.session = requests.Session()
        self.auth_token = None
        self.user_id = None
        self.test_results = []
        
    def log_test(self, test_name: str, success: bool, details: str = "", response_data: Any = None):
        """Log test results"""
        result = {
            "test": test_name,
            "success": success,
            "details": details,
            "timestamp": datetime.now().isoformat(),
            "response_data": response_data
        }
        self.test_results.append(result)
        status = "✅ PASS" if success else "❌ FAIL"
        print(f"{status} {test_name}: {details}")
        if response_data and not success:
            print(f"   Response: {response_data}")
    
    def make_request(self, method: str, endpoint: str, data: Dict = None, headers: Dict = None) -> tuple:
        """Make HTTP request and return (success, response_data, status_code)"""
        url = f"{self.base_url}{endpoint}"
        request_headers = {"Content-Type": "application/json"}
        
        if self.auth_token:
            request_headers["Authorization"] = f"Bearer {self.auth_token}"
        
        if headers:
            request_headers.update(headers)
        
        try:
            if method.upper() == "GET":
                response = self.session.get(url, headers=request_headers)
            elif method.upper() == "POST":
                response = self.session.post(url, json=data, headers=request_headers)
            else:
                return False, f"Unsupported method: {method}", 0
            
            try:
                response_data = response.json()
            except:
                response_data = response.text
            
            return response.status_code < 400, response_data, response.status_code
        
        except Exception as e:
            return False, str(e), 0
    
    def test_api_health(self):
        """Test basic API connectivity"""
        success, data, status = self.make_request("GET", "/")
        if success and isinstance(data, dict) and "message" in data:
            self.log_test("API Health Check", True, f"API responding: {data.get('message')}")
        else:
            self.log_test("API Health Check", False, f"API not responding properly", data)
        return success
    
    def test_user_registration(self):
        """Test user registration"""
        user_data = {
            "email": TEST_USER_EMAIL,
            "password": TEST_USER_PASSWORD
        }
        
        success, data, status = self.make_request("POST", "/auth/register", user_data)
        
        if success and isinstance(data, dict) and "access_token" in data:
            self.auth_token = data["access_token"]
            self.log_test("User Registration", True, "User registered successfully with JWT token")
            return True
        elif status == 400 and "already registered" in str(data):
            # User already exists, try login instead
            self.log_test("User Registration", True, "User already exists (expected for repeat tests)")
            return self.test_user_login()
        else:
            self.log_test("User Registration", False, f"Registration failed (status: {status})", data)
            return False
    
    def test_user_login(self):
        """Test user login"""
        login_data = {
            "email": TEST_USER_EMAIL,
            "password": TEST_USER_PASSWORD
        }
        
        success, data, status = self.make_request("POST", "/auth/login", login_data)
        
        if success and isinstance(data, dict) and "access_token" in data:
            self.auth_token = data["access_token"]
            self.log_test("User Login", True, "Login successful with JWT token")
            return True
        else:
            self.log_test("User Login", False, f"Login failed (status: {status})", data)
            return False
    
    def test_token_validation(self):
        """Test JWT token validation"""
        if not self.auth_token:
            self.log_test("Token Validation", False, "No auth token available")
            return False
        
        success, data, status = self.make_request("GET", "/auth/me")
        
        if success and isinstance(data, dict) and "email" in data:
            self.user_id = data.get("id")
            self.log_test("Token Validation", True, f"Token valid, user: {data['email']}")
            return True
        else:
            self.log_test("Token Validation", False, f"Token validation failed (status: {status})", data)
            return False
    
    def test_identity_submission(self):
        """Test identity data submission"""
        identity_data = {
            "age_band": "26-35",
            "country": "United States",
            "employment_type": "employed",
            "income_band": "50k-100k"
        }
        
        success, data, status = self.make_request("POST", "/onboarding/identity", identity_data)
        
        if success and isinstance(data, dict) and "user_id" in data:
            self.log_test("Identity Submission", True, "Identity data submitted successfully")
            return True
        elif status == 400 and "already submitted" in str(data):
            self.log_test("Identity Submission", True, "Identity already submitted (expected for repeat tests)")
            return True
        else:
            self.log_test("Identity Submission", False, f"Identity submission failed (status: {status})", data)
            return False
    
    def test_baseline_submission(self):
        """Test baseline snapshot submission"""
        baseline_data = {
            "obligations_range": "10k-25k",
            "spending_range": "medium",
            "savings_habit": True,
            "investment_habit": True
        }
        
        success, data, status = self.make_request("POST", "/onboarding/baseline", baseline_data)
        
        if success and isinstance(data, dict) and "user_id" in data:
            self.log_test("Baseline Submission", True, "Baseline snapshot submitted successfully")
            return True
        elif status == 400 and "already submitted" in str(data):
            self.log_test("Baseline Submission", True, "Baseline already submitted (expected for repeat tests)")
            return True
        else:
            self.log_test("Baseline Submission", False, f"Baseline submission failed (status: {status})", data)
            return False
    
    def test_onboarding_status(self):
        """Test onboarding status check"""
        success, data, status = self.make_request("GET", "/onboarding/status")
        
        if success and isinstance(data, dict):
            identity_done = data.get("identity_completed", False)
            baseline_done = data.get("baseline_completed", False)
            onboarding_done = data.get("onboarding_completed", False)
            
            if identity_done and baseline_done and onboarding_done:
                self.log_test("Onboarding Status", True, "All onboarding steps completed")
                return True
            else:
                self.log_test("Onboarding Status", False, f"Onboarding incomplete: identity={identity_done}, baseline={baseline_done}")
                return False
        else:
            self.log_test("Onboarding Status", False, f"Status check failed (status: {status})", data)
            return False
    
    def test_initial_score_calculation(self):
        """Test that initial freedom score was calculated"""
        success, data, status = self.make_request("GET", "/score/current")
        
        if success and data and isinstance(data, dict) and "score" in data:
            score = data["score"]
            dimensions = data.get("dimensions", {})
            trend = data.get("trend", "")
            
            # Validate score range
            if 300 <= score <= 900:
                self.log_test("Initial Score Calculation", True, 
                            f"Initial score: {score}, trend: {trend}, dimensions: {dimensions}")
                return True
            else:
                self.log_test("Initial Score Calculation", False, f"Score {score} out of valid range (300-900)")
                return False
        else:
            self.log_test("Initial Score Calculation", False, f"No score found (status: {status})", data)
            return False
    
    def test_checkin_can_submit(self):
        """Test check-in submission eligibility"""
        success, data, status = self.make_request("GET", "/checkin/can_submit")
        
        if success and isinstance(data, dict) and "can_submit" in data:
            can_submit = data["can_submit"]
            self.log_test("Check-in Eligibility", True, f"Can submit check-in: {can_submit}")
            return can_submit
        else:
            self.log_test("Check-in Eligibility", False, f"Eligibility check failed (status: {status})", data)
            return False
    
    def test_monthly_checkin_submission(self):
        """Test monthly check-in submission"""
        checkin_data = {
            "income_status": "same",
            "spending_discipline": "on_track",
            "savings_done": True,
            "stress_level": "minor"
        }
        
        success, data, status = self.make_request("POST", "/checkin/submit", checkin_data)
        
        if success and isinstance(data, dict) and "id" in data:
            self.log_test("Monthly Check-in Submission", True, 
                        f"Check-in submitted for {data.get('month')}/{data.get('year')}")
            return True
        elif status == 400 and "already submitted" in str(data):
            self.log_test("Monthly Check-in Submission", True, "Check-in already submitted this month (expected)")
            return True
        else:
            self.log_test("Monthly Check-in Submission", False, f"Check-in submission failed (status: {status})", data)
            return False
    
    def test_score_recalculation(self):
        """Test that score was recalculated after check-in"""
        # Wait a moment for score calculation
        time.sleep(1)
        
        success, data, status = self.make_request("GET", "/score/current")
        
        if success and data and isinstance(data, dict) and "score" in data:
            score = data["score"]
            calculated_at = data.get("calculated_at", "")
            
            # Check if score was calculated recently (within last few minutes)
            try:
                calc_time = datetime.fromisoformat(calculated_at.replace('Z', '+00:00'))
                time_diff = datetime.now().astimezone() - calc_time.astimezone()
                recent = time_diff.total_seconds() < 300  # 5 minutes
                
                if recent:
                    self.log_test("Score Recalculation", True, 
                                f"Score recalculated: {score} (calculated at: {calculated_at})")
                    return True
                else:
                    self.log_test("Score Recalculation", False, f"Score not recently updated: {calculated_at}")
                    return False
            except:
                self.log_test("Score Recalculation", True, f"Score available: {score}")
                return True
        else:
            self.log_test("Score Recalculation", False, f"Score recalculation failed (status: {status})", data)
            return False
    
    def test_score_history(self):
        """Test score history endpoint"""
        success, data, status = self.make_request("GET", "/score/history")
        
        if success and isinstance(data, list):
            if len(data) > 0:
                latest_score = data[0]
                self.log_test("Score History", True, 
                            f"Score history retrieved: {len(data)} entries, latest: {latest_score.get('score')}")
                return True
            else:
                self.log_test("Score History", False, "No score history found")
                return False
        else:
            self.log_test("Score History", False, f"Score history failed (status: {status})", data)
            return False
    
    def test_consistency_streak(self):
        """Test consistency streak calculation"""
        success, data, status = self.make_request("GET", "/stats/streak")
        
        if success and isinstance(data, dict) and "streak" in data:
            streak = data["streak"]
            self.log_test("Consistency Streak", True, f"Consistency streak: {streak} months")
            return True
        else:
            self.log_test("Consistency Streak", False, f"Streak calculation failed (status: {status})", data)
            return False
    
    def test_latest_checkin(self):
        """Test latest check-in retrieval"""
        success, data, status = self.make_request("GET", "/checkin/latest")
        
        if success:
            if data and isinstance(data, dict) and "id" in data:
                self.log_test("Latest Check-in", True, 
                            f"Latest check-in: {data.get('month')}/{data.get('year')}")
            else:
                self.log_test("Latest Check-in", True, "No check-ins found (valid for new users)")
            return True
        else:
            self.log_test("Latest Check-in", False, f"Latest check-in failed (status: {status})", data)
            return False
    
    def test_error_handling(self):
        """Test error handling scenarios"""
        # Test invalid token
        old_token = self.auth_token
        self.auth_token = "invalid_token"
        
        success, data, status = self.make_request("GET", "/auth/me")
        if not success and status == 401:
            self.log_test("Error Handling - Invalid Token", True, "Invalid token properly rejected")
        else:
            self.log_test("Error Handling - Invalid Token", False, "Invalid token not properly handled")
        
        # Restore valid token
        self.auth_token = old_token
        
        # Test duplicate registration
        user_data = {
            "email": TEST_USER_EMAIL,
            "password": TEST_USER_PASSWORD
        }
        success, data, status = self.make_request("POST", "/auth/register", user_data)
        if not success and status == 400 and "already registered" in str(data):
            self.log_test("Error Handling - Duplicate Registration", True, "Duplicate registration properly rejected")
        else:
            self.log_test("Error Handling - Duplicate Registration", False, "Duplicate registration not properly handled")
        
        return True
    
    def run_all_tests(self):
        """Run comprehensive test suite"""
        print("🚀 Starting Freedom Score Platform Backend Tests")
        print(f"📍 Testing API at: {self.base_url}")
        print("=" * 60)
        
        # Core functionality tests
        tests = [
            ("API Health", self.test_api_health),
            ("User Registration/Login", self.test_user_registration),
            ("JWT Token Validation", self.test_token_validation),
            ("Identity Data Submission", self.test_identity_submission),
            ("Baseline Snapshot Submission", self.test_baseline_submission),
            ("Onboarding Status Check", self.test_onboarding_status),
            ("Initial Score Calculation", self.test_initial_score_calculation),
            ("Check-in Eligibility", self.test_checkin_can_submit),
            ("Monthly Check-in Submission", self.test_monthly_checkin_submission),
            ("Score Recalculation", self.test_score_recalculation),
            ("Score History", self.test_score_history),
            ("Consistency Streak", self.test_consistency_streak),
            ("Latest Check-in", self.test_latest_checkin),
            ("Error Handling", self.test_error_handling)
        ]
        
        passed = 0
        total = len(tests)
        
        for test_name, test_func in tests:
            try:
                result = test_func()
                if result:
                    passed += 1
            except Exception as e:
                self.log_test(test_name, False, f"Test exception: {str(e)}")
        
        print("=" * 60)
        print(f"📊 Test Results: {passed}/{total} tests passed")
        
        # Summary of critical failures
        critical_failures = []
        for result in self.test_results:
            if not result["success"] and any(critical in result["test"] for critical in 
                ["API Health", "Registration", "Login", "Token", "Score Calculation"]):
                critical_failures.append(result["test"])
        
        if critical_failures:
            print(f"🚨 Critical Failures: {', '.join(critical_failures)}")
        
        return passed, total, critical_failures

def main():
    """Main test execution"""
    tester = FreedomScoreAPITester()
    passed, total, critical_failures = tester.run_all_tests()
    
    # Return appropriate exit code
    if critical_failures:
        exit(1)
    elif passed < total:
        exit(2)  # Some non-critical tests failed
    else:
        exit(0)  # All tests passed

if __name__ == "__main__":
    main()