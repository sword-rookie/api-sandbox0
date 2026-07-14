package dto

// UpdateProfileRequest holds the fields a user can update on their profile.
type UpdateProfileRequest struct {
	Name      string `json:"name"`
	Username  string `json:"username"`
	Email     string `json:"email"`
	Bio       string `json:"bio"`
	Location  string `json:"location"`
	AvatarURL string `json:"avatar_url"`
}

// ProfileResponse represents a user's profile returned to the frontend.
type ProfileResponse struct {
	ID        string `json:"id"`
	Name      string `json:"name"`
	Username  string `json:"username"`
	Email     string `json:"email"`
	Bio       string `json:"bio"`
	Location  string `json:"location"`
	AvatarURL string `json:"avatar_url"`
}
