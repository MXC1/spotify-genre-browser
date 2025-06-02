variable "github_token_value" {
  description = "GitHub token value"
  type        = string
  sensitive   = true
}

variable "spotify_client_id_value" {
  description = "Spotify client ID value"
  type        = string
  sensitive   = true
}

variable "email_address_value" {
  description = "Email address for budget alerts"
  type        = string
  sensitive   = true
}

resource "aws_ssm_parameter" "github_token" {
  name        = "/github_token"
  description = "GitHub token for CodePipeline Terraform access"
  type        = "SecureString"
  value       = var.github_token_value
  overwrite   = true
}

resource "aws_ssm_parameter" "spotify_client_id" {
  name        = "/spotify_client_id"
  description = "Spotify client ID for CodePipeline Terraform access"
  type        = "SecureString"
  value       = var.spotify_client_id_value
  overwrite   = true
}

resource "aws_ssm_parameter" "email_address" {
  name        = "/email_address"
  description = "Email address for budget alerts"
  type        = "SecureString"
  value       = var.email_address_value
  overwrite   = true
}