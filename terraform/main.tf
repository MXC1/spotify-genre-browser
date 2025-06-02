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

variable "env" {
  type    = string
  default = ""
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

locals {
  env = var.env != "" ? var.env : terraform.workspace
}

# TFState module

module "terraform_state" {
  source = "./modules/terraform_state"
}

# Hosting module

module "hosting" {
  source = "./modules/hosting"

  # Required parameters
  project_name      = "genre-browser"
  env               = local.env
  repository_name   = "MXC1/spotify-genre-browser"
  repository_branch = local.env

  spotify_client_id = var.spotify_client_id
  feedback_endpoint = module.feedback.api_url
  pkce_endpoint     = module.pkce_proxy.api_url
  log_endpoint      = module.write_log.api_url

  github_token = var.github_token
}

output "website_endpoint" {
  value = module.hosting.website_endpoint
  # value       = module.storage.website_endpoint
  description = "S3 website endpoint"
}

output "cloudfront_domain_name" {
  value       = "https://${module.hosting.cloudfront_domain_name}"
  description = "CloudFront distribution domain name"
}

output "codepipeline_name" {
  value       = module.hosting.codepipeline_name
  description = "Name of the CodePipeline"
}

output "deployment_role_arn" {
  value       = module.hosting.deployment_role_arn
  description = "ARN of the deployment IAM role"
}

# Log module

module "write_log" {
  source         = "./modules/write_log"
  env            = local.env
  lambda_zip     = "./modules/write_log/lambda_write_log.zip"
  lambda_handler = "index.handler"
  lambda_runtime = "nodejs18.x"
  allowed_origins = concat(
    local.env == "dev" ? ["http://localhost:3000"] : [],
    ["https://${module.hosting.cloudfront_domain_name}"]
  )
}

output "write_log_api_url" {
  value = module.write_log.api_url
}

# Feedback module

module "feedback" {
  source         = "./modules/feedback"
  env            = local.env
  lambda_zip     = "./modules/feedback/feedback_lambda.zip"
  lambda_handler = "index.handler"
  lambda_runtime = "nodejs18.x"
  allowed_origins = concat(
    local.env == "dev" ? ["http://localhost:3000"] : [],
    ["https://${module.hosting.cloudfront_domain_name}"]
  )
}

output "feedback_api_url" {
  value = module.feedback.api_url
}

# PKCE module

module "pkce_proxy" {
  source         = "./modules/pkce_proxy"
  env            = local.env
  lambda_zip     = "./modules/pkce_proxy/pkce_proxy_lambda.zip"
  lambda_handler = "index.handler"
  lambda_runtime = "nodejs18.x"
  allowed_origins = concat(
    local.env == "dev" ? ["http://localhost:3000"] : [],
    ["https://${module.hosting.cloudfront_domain_name}"]
  )
}

output "pkce_proxy_endpoint" {
  value = module.pkce_proxy.api_url
}

# Dashboards module

module "dashboards" {
  source = "./modules/dashboards"

  log_group_name = module.write_log.log_group_name
  env            = local.env
}

# Parameter Store module

module "parameter_store" {
  source = "./modules/parameter_store"

  github_token_value      = var.github_token
  spotify_client_id_value = var.spotify_client_id
}