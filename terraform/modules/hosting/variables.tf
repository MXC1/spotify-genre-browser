variable "github_token" {
  description = "GitHub personal access token with repo access"
  type        = string
  sensitive   = true
}

variable "env" {
  description = "Environment name"
  type        = string
}

variable "feedback_endpoint" {
  description = "Feedback API endpoint URL"
  type        = string
}

variable "pkce_endpoint" {
  description = "PKCE proxy API endpoint URL"
  type        = string
}

variable "log_endpoint" {
  description = "Log API endpoint URL"
  type        = string
}

variable "spotify_client_id" {
  description = "Spotify client ID"
  type        = string
  sensitive   = true
}