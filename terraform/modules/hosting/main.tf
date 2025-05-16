# terraform {
#   required_providers {
#     aws = {
#       source  = "hashicorp/aws"
#       version = "~> 5.0" # Use whatever version you're currently using
#     }
#     null = {
#       source  = "hashicorp/null"
#       version = "~> 3.0"
#     }
#   }
# }

resource "aws_iam_role" "amplify_service" {
  name = "amplify-service-role-${var.env}"

  assume_role_policy = jsonencode({
    Version = "2012-10-17"
    Statement = [{
      Effect = "Allow"
      Principal = {
        Service = "amplify.amazonaws.com"
      }
      Action = "sts:AssumeRole"
    }]
  })
}

resource "aws_iam_role_policy_attachment" "amplify_policy" {
  role       = aws_iam_role.amplify_service.name
  policy_arn = "arn:aws:iam::aws:policy/AdministratorAccess-Amplify"
}

resource "aws_amplify_app" "genre_browser" {
  name                = "genre-browser-${var.env}"
  repository          = "https://github.com/MXC1/spotify-genre-browser"
  access_token        = var.github_token
  platform            = "WEB"
  iam_service_role_arn = aws_iam_role.amplify_service.arn

  environment_variables = {
    NODE_ENV = var.env
    REACT_APP_SPOTIFY_CLIENT_ID = var.spotify_client_id
  }
}

resource "aws_amplify_branch" "branch" {
  app_id      = aws_amplify_app.genre_browser.id
  branch_name = var.env
  stage       = var.env == "main" ? "PRODUCTION" : "DEVELOPMENT"
  # enable_auto_build = true

  environment_variables = {
    REACT_APP_ENV              = var.env
    REACT_APP_FEEDBACK_ENDPOINT = var.feedback_endpoint
    REACT_APP_PKCE_ENDPOINT    = var.pkce_endpoint
    REACT_APP_LOG_ENDPOINT     = var.log_endpoint
  }
}

# resource "null_resource" "trigger_build" {
#   depends_on = [aws_amplify_branch.branch]
  
#   provisioner "local-exec" {
#     command = "aws --profile genrebrowser amplify start-job --app-id ${aws_amplify_app.genre_browser.id} --branch-name ${aws_amplify_branch.branch.branch_name} --job-type RELEASE"
#   }
# }

output "hosting_url" {
  value = aws_amplify_app.genre_browser.default_domain
}