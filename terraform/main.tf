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

module "write_log" {
  source             = "./modules/write_log"
  env                = local.env
  lambda_zip         = "./modules/write_log/lambda_write_log.zip"
  lambda_handler     = "index.handler"
  lambda_runtime     = "nodejs18.x"
  allowed_origins    = [
    "http://localhost:3000",
    "https://staging.d1oxklzichgkwx.amplifyapp.com",
    "https://main.d1oxklzichgkwx.amplifyapp.com"
  ]
}

output "api_url" {
  value = module.write_log.api_url
}

