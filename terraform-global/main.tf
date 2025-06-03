provider "aws" {
  region  = "eu-west-2"
}

terraform {
  backend "s3" {
    bucket  = "genrebrowser-tf-state"
    key     = "global/s3/terraform.tfstate"
    region  = "eu-west-2"
    encrypt = true

    use_lockfile = true
  }
}

# Budget alerts module

variable "email_address" {
  description = "Email address to send budget alerts to"
  type        = string
}

variable "spotify_client_id" {
  description = "Spotify client ID"
  type        = string
  sensitive   = true
}

variable "github_token" {
  description = "GitHub token"
  type        = string
  sensitive   = true
}

module "budget_alerts" {
  source = "./modules/budget_alerts"

  monthly_budget_amount = 10
  email_address         = var.email_address
}

# Parameter Store module

module "parameter_store" {
  source = "./modules/parameter_store"

  github_token_value      = var.github_token
  spotify_client_id_value = var.spotify_client_id
  email_address_value     = var.email_address
}