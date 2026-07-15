import requests

# 1. Login
url = "http://localhost:8081/api/auth/login"
payload = {
    "email": "adith07nair@gmail.com",
    "password": "Password123!"  # Guessing password based on typical test accounts, or we can just register a new one.
}
# Actually, let's just register a new user to test the whole flow.
register_payload = {
    "name": "Test User",
    "username": "testuser",
    "email": "testuser1@example.com",
    "password": "Password123!"
}
requests.post("http://localhost:8081/api/auth/register", json=register_payload)

s = requests.Session()
login_res = s.post("http://localhost:8081/api/auth/login", json={
    "email": "testuser1@example.com",
    "password": "Password123!"
})
print("Login:", login_res.status_code)

update_payload = {
    "name": "Test User",
    "username": "testuser",
    "bio": "STUDYING",
    "location": "mangaluru",
    "avatar_url": "http://localhost:8081/uploads/avatars/test.jpeg"
}
put_res = s.put("http://localhost:8081/api/users/me", json=update_payload)
print("PUT Profile:", put_res.status_code, put_res.text)
