provider "aws" {
  region  = "eu-west-2"
  profile = "genrebrowser"
}

terraform {
  backend "s3" {
    profile = "genrebrowser"
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

module "budget_alerts" {
  source = "./modules/budget_alerts"

  monthly_budget_amount = 10
  email_address         = var.email_address
}