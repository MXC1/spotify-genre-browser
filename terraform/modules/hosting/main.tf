##################################################
# Main Configuration
##################################################

terraform {
  required_version = ">= 1.0.0"
  required_providers {
    aws = {
      source  = "hashicorp/aws"
      version = "~> 5.0"
    }
  }
}

##################################################
# Variables
##################################################

variable "aws_region" {
  description = "AWS region to deploy resources"
  type        = string
  default     = "eu-west-2"
}

variable "project_name" {
  description = "Name of the project"
  type        = string
  default     = "genre-browser"
}

variable "env" {
  description = "Environment name (i.e., dev, staging, prod)"
  type        = string
}

variable "repository_name" {
  description = "Name of the CodeCommit repository (or connection to GitHub)"
  type        = string
  default     = "MXC1/spotify-genre-browser"
}

variable "repository_branch" {
  description = "Branch of the repository to deploy"
  type        = string
  default     = "dev"
}

variable "domain_name" {
  description = "Domain name for the website (optional)"
  type        = string
  default     = ""
}

variable "use_existing_domain" {
  description = "Whether to use an existing domain configuration"
  type        = bool
  default     = false
}

variable "feedback_endpoint" {
  description = "API endpoint for feedback"
  type        = string
  default     = ""
}

variable "pkce_endpoint" {
  description = "API endpoint for PKCE"
  type        = string
  default     = ""
}

variable "log_endpoint" {
  description = "API endpoint for logging"
  type        = string
  default     = ""
}

variable "spotify_client_id" {
  description = "Spotify client ID"
  type        = string
  default     = ""
  sensitive   = true
}

variable "github_token" {
  description = "GitHub token"
  type        = string
  default     = ""
  sensitive   = true
}

##################################################
# Module Invocations
##################################################

module "storage" {
  source       = "./modules/storage"
  project_name = var.project_name
  environment  = var.env
}

module "cdn" {
  source              = "./modules/cdn"
  project_name        = var.project_name
  environment         = var.env
  website_bucket      = module.storage.website_bucket
  domain_name         = var.domain_name
  use_existing_domain = var.use_existing_domain
}

module "cicd" {
  source             = "./modules/cicd"
  project_name       = var.project_name
  environment        = var.env
  repository_name    = var.repository_name
  repository_branch  = var.env
  website_bucket     = module.storage.website_bucket
  cloudfront_dist_id = module.cdn.cloudfront_distribution_id

  spotify_client_id = var.spotify_client_id
  feedback_endpoint = var.feedback_endpoint
  pkce_endpoint     = var.pkce_endpoint
  log_endpoint      = var.log_endpoint

  github_token = var.github_token
}

##################################################
# Outputs
##################################################

output "website_endpoint" {
  value       = module.storage.website_endpoint
  description = "S3 website endpoint"
}

output "cloudfront_domain_name" {
  value       = module.cdn.cloudfront_domain_name
  description = "CloudFront distribution domain name"
}

output "codepipeline_name" {
  value       = module.cicd.codepipeline_name
  description = "Name of the CodePipeline"
}

output "deployment_role_arn" {
  value       = module.cicd.deployment_role_arn
  description = "ARN of the deployment IAM role"
}
