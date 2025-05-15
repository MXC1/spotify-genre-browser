# main.tf
provider "aws" {
  region = "eu-west-2"   # or your preferred AWS region
  profile =  "genrebrowser"
}

variable "env" {
  type = string
  default = ""
}

locals {
  env = var.env != "" ? var.env : terraform.workspace
}

resource "aws_apigatewayv2_api" "log_api" {
  name          = "log-api"
  protocol_type = "HTTP"

  cors_configuration {
    allow_origins = ["http://localhost:3000", "https://staging.d1oxklzichgkwx.amplifyapp.com", "https://main.d1oxklzichgkwx.amplifyapp.com"]
    allow_methods = ["POST", "OPTIONS"]
    allow_headers = ["*"]
    max_age       = 3600
  }
}

resource "aws_apigatewayv2_stage" "stage" {
  api_id      = aws_apigatewayv2_api.log_api.id
  name        = "${local.env}"
  auto_deploy = true
}

output "api_url" {
  value = "${aws_apigatewayv2_api.log_api.api_endpoint}/${local.env}"
}

resource "aws_lambda_function" "write_log" {
  function_name = "write-log-${local.env}"
  role          = aws_iam_role.lambda_exec.arn
  handler       = "index.handler"
  runtime       = "nodejs18.x"
  filename      = "lambda_write_log.zip"
  source_code_hash = filebase64sha256("lambda_write_log.zip")
}

resource "aws_iam_role" "lambda_exec" {
  name = "lambda-exec-role-${local.env}"

  assume_role_policy = jsonencode({
    Version = "2012-10-17",
    Statement = [{
      Action = "sts:AssumeRole",
      Effect = "Allow",
      Principal = {
        Service = "lambda.amazonaws.com"
      }
    }]
  })
}

resource "aws_iam_role_policy_attachment" "lambda_logging" {
  role       = aws_iam_role.lambda_exec.name
  policy_arn = "arn:aws:iam::aws:policy/service-role/AWSLambdaBasicExecutionRole"
}

resource "aws_apigatewayv2_integration" "log_integration" {
  api_id           = aws_apigatewayv2_api.log_api.id
  integration_type = "AWS_PROXY"
  integration_uri  = aws_lambda_function.write_log.invoke_arn
  integration_method = "POST"
  payload_format_version = "2.0"
}

resource "aws_apigatewayv2_route" "log_route" {
  api_id    = aws_apigatewayv2_api.log_api.id
  route_key = "POST /logs"
  target    = "integrations/${aws_apigatewayv2_integration.log_integration.id}"
}

resource "aws_lambda_permission" "apigw_invoke" {
  statement_id  = "AllowAPIGatewayInvoke"
  action        = "lambda:InvokeFunction"
  function_name = aws_lambda_function.write_log.function_name
  principal     = "apigateway.amazonaws.com"
  source_arn    = "${aws_apigatewayv2_api.log_api.execution_arn}/*/*"
}

