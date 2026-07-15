package main

import (
	"bytes"
	"encoding/json"
	"fmt"
	"io"
	"net/http"
	"time"

	"github.com/pquerna/otp/totp"
)

const baseURL = "http://localhost:8081/api/auth"

func main() {
	client := &http.Client{Timeout: 5 * time.Second}
	email := fmt.Sprintf("test%d@example.com", time.Now().Unix())
	password := "SecurePassword123!"

	// 1. Register
	fmt.Println("1. Registering user...")
	regBody := map[string]string{
		"name":     "Test User",
		"email":    email,
		"password": password,
	}
	regRes, _ := post(client, "/register", regBody, "")
	
	var regData map[string]interface{}
	json.Unmarshal(regRes, &regData)
	userID := regData["id"].(string)
	fmt.Printf("   User registered with ID: %s\n", userID)

	// 2. Generate MFA
	fmt.Println("2. Generating MFA Secret...")
	genRes, _ := post(client, "/mfa/generate", nil, userID)
	
	var genData map[string]interface{}
	json.Unmarshal(genRes, &genData)
	secret := genData["secret"].(string)
	fmt.Printf("   Received MFA Secret: %s\n", secret)

	// 3. Verify MFA
	fmt.Println("3. Verifying MFA...")
	code, _ := totp.GenerateCode(secret, time.Now())
	verifyBody := map[string]string{"totp_code": code}
	verifyRes, _ := post(client, "/mfa/verify", verifyBody, userID)
	fmt.Printf("   Verify Response: %s\n", string(verifyRes))

	// 4. Login (Step 1)
	fmt.Println("4. Logging in (Step 1)...")
	loginBody := map[string]string{"email": email, "password": password}
	loginRes, _ := post(client, "/login", loginBody, "")
	
	var loginData map[string]interface{}
	json.Unmarshal(loginRes, &loginData)
	requiresMFA := loginData["requires_mfa"].(bool)
	tempToken := loginData["temp_token"].(string)
	fmt.Printf("   Requires MFA: %t, Temp Token received: %t\n", requiresMFA, tempToken != "")

	// 5. Login MFA (Step 2)
	fmt.Println("5. Logging in (Step 2)...")
	code2, _ := totp.GenerateCode(secret, time.Now())
	loginMfaBody := map[string]string{
		"temp_token": tempToken,
		"totp_code":  code2,
	}
	finalRes, headers := postHeaders(client, "/login/mfa", loginMfaBody, "")
	fmt.Printf("   Final Response: %s\n", string(finalRes))
	fmt.Printf("   Set-Cookie headers: %v\n", headers["Set-Cookie"])
}

func post(client *http.Client, path string, body interface{}, userID string) ([]byte, error) {
	b, _ := postHeaders(client, path, body, userID)
	return b, nil
}

func postHeaders(client *http.Client, path string, body interface{}, userID string) ([]byte, http.Header) {
	var bodyReader io.Reader
	if body != nil {
		b, _ := json.Marshal(body)
		bodyReader = bytes.NewReader(b)
	}

	req, _ := http.NewRequest("POST", baseURL+path, bodyReader)
	req.Header.Set("Content-Type", "application/json")
	if userID != "" {
		req.Header.Set("X-User-ID", userID)
	}

	res, err := client.Do(req)
	if err != nil {
		panic(err)
	}
	defer res.Body.Close()
	b, _ := io.ReadAll(res.Body)
	return b, res.Header
}
