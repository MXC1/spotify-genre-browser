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

