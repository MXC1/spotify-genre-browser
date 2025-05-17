provider "aws" {
  region  = "eu-west-2"
  profile = "genrebrowser"
}

variable "env" {
  type    = string
  default = ""
}

locals {
  env = var.env != "" ? var.env : terraform.workspace
}

# Hosting module

module "hosting" {
  source       = "./modules/hosting"
  
  # Required parameters
  project_name       = "genre-browser"
  env                = local.env
  repository_name    = "https://github.com/MXC1/spotify-genre-browser"
  repository_branch  = local.env

  # Optional with defaults
  # domain_name      = ""
  # use_existing_domain = false
}

output "website_endpoint" {
  value       = module.hosting.website_endpoint
  # value       = module.storage.website_endpoint
  description = "S3 website endpoint"
}

output "cloudfront_domain_name" {
  value       = module.hosting.cloudfront_domain_name
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
  source             = "./modules/write_log"
  env                = local.env
  lambda_zip         = "./modules/write_log/lambda_write_log.zip"
  lambda_handler     = "index.handler"
  lambda_runtime     = "nodejs18.x"
  allowed_origins    = [
    "http://localhost:3000",
    "https://staging.d2wb7vdb8dayud.amplifyapp.com",
    "https://main.d2wb7vdb8dayud.amplifyapp.com"
  ]
}

output "write_log_api_url" {
  value = module.write_log.api_url
}

# Feedback module

module "feedback" {
  source             = "./modules/feedback"
  env                = local.env
  lambda_zip         = "./modules/feedback/feedback_lambda.zip"
  lambda_handler     = "index.handler"
  lambda_runtime     = "nodejs18.x"
  allowed_origins    = [
    "http://localhost:3000",
    "https://staging.d2wb7vdb8dayud.amplifyapp.com",
    "https://main.d2wb7vdb8dayud.amplifyapp.com"
  ]
}

output "feedback_api_url" {
  value = module.feedback.api_url
}

# PKCE module

module "pkce_proxy" {
  source             = "./modules/pkceProxy"
  env                = local.env
  lambda_zip         = "./modules/pkceProxy/pkce_proxy_lambda.zip"
  lambda_handler     = "index.handler"
  lambda_runtime     = "nodejs18.x"
  allowed_origins    = [
    "http://localhost:3000",
    "https://staging.d2wb7vdb8dayud.amplifyapp.com",
    "https://main.d2wb7vdb8dayud.amplifyapp.com"
  ]
}

output "pkce_proxy_endpoint" {
  value = module.pkce_proxy.api_url
}

