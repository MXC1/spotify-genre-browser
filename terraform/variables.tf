variable "env" {
  type    = string
  default = ""
}

variable "github_token" {
  description = "GitHub personal access token with repo access"
  type        = string
  sensitive   = true
}

variable "spotify_client_id" {
  description = "Spotify client ID for authentication"
  type        = string
  sensitive   = true
}