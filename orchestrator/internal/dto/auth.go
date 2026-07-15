package dto

// RegisterRequest holds the fields required to sign up.
type RegisterRequest struct {
	Name     string `json:"name"`
	Email    string `json:"email"`
	Password string `json:"password"`
}

// RegisterResponse represents the response returned upon successful signup.
type RegisterResponse struct {
	ID      string `json:"id"`
	Name    string `json:"name"`
	Email   string `json:"email"`
	Message string `json:"message"`
}

// LoginRequest holds fields for step 1 of login
type LoginRequest struct {
	Email    string `json:"email"`
	Password string `json:"password"`
}

type LoginResponse struct {
	RequiresMFA bool   `json:"requires_mfa,omitempty"`
	TempToken   string `json:"temp_token,omitempty"`
}

type MFALoginRequest struct {
	TempToken string `json:"temp_token"`
	TOTPCode  string `json:"totp_code"`
}

type MFAGenerateResponse struct {
	Secret string `json:"secret"`
	URI    string `json:"uri"`
}

type MFAVerifyRequest struct {
	TOTPCode string `json:"totp_code"`
}

type ForgotPasswordRequest struct {
	Email string `json:"email"`
}

type ResetPasswordRequest struct {
	Token       string `json:"token"`
	NewPassword string `json:"new_password"`
}
