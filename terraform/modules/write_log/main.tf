variable "env" {
  type = string
}

variable "lambda_zip" {
  type = string
}

variable "lambda_handler" {
  type = string
}

variable "lambda_runtime" {
  type = string
}

variable "allowed_origins" {
  type = list(string)
}

resource "aws_apigatewayv2_api" "log_api" {
  name          = "log-api"
  protocol_type = "HTTP"

  cors_configuration {
    allow_origins = var.allowed_origins
    allow_methods = ["POST", "OPTIONS"]
    allow_headers = ["*"]
    max_age       = 3600
  }
}

// Add CloudWatch Log Group for API Gateway access logs
resource "aws_cloudwatch_log_group" "api_access_log" {
  name = "/aws/apigateway/log-api-access-${var.env}"
  retention_in_days = 14
}

resource "aws_apigatewayv2_stage" "stage" {
  api_id      = aws_apigatewayv2_api.log_api.id
  name        = var.env
  auto_deploy = true

  access_log_settings {
    destination_arn = aws_cloudwatch_log_group.api_access_log.arn
    format = jsonencode({
      requestId       = "$context.requestId"
      ip              = "$context.identity.sourceIp"
      requestTime     = "$context.requestTime"
      httpMethod      = "$context.httpMethod"
      routeKey        = "$context.routeKey"
      status          = "$context.status"
      protocol        = "$context.protocol"
      responseLength  = "$context.responseLength"
      integrationErrorMessage = "$context.integrationErrorMessage"
    })
  }
}

resource "aws_lambda_function" "write_log" {
  function_name    = "write-log-${var.env}"
  role             = aws_iam_role.lambda_exec.arn
  handler          = var.lambda_handler
  runtime          = var.lambda_runtime
  filename         = var.lambda_zip
  source_code_hash = filebase64sha256(var.lambda_zip)
}

resource "aws_iam_role" "lambda_exec" {
  name = "lambda-exec-role-${var.env}"

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
  api_id                 = aws_apigatewayv2_api.log_api.id
  integration_type       = "AWS_PROXY"
  integration_uri        = aws_lambda_function.write_log.invoke_arn
  integration_method     = "POST"
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

output "api_url" {
  value = "${aws_apigatewayv2_api.log_api.api_endpoint}/${var.env}"
}
