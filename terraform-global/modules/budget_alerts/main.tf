variable "monthly_budget_amount" {
  description = "The monthly budget amount in USD"
  type        = number
}

variable "email_address" {
  description = "Email address to send budget alerts to"
  type        = string
}

variable "alert_thresholds" {
  description = "List of threshold percentages for budget alerts"
  type        = list(number)
  default     = [50, 80, 90, 100]
}

resource "aws_sns_topic" "budget_alerts" {
  name = "budget-alerts"
}

resource "aws_sns_topic_policy" "budget_alerts_policy" {
  arn    = aws_sns_topic.budget_alerts.arn
  policy = jsonencode({
    Version = "2012-10-17",
    Statement = [
      {
        Sid       = "AllowBudgetsToPublish",
        Effect    = "Allow",
        Principal = {
          Service = "budgets.amazonaws.com"
        },
        Action    = "SNS:Publish",
        Resource  = aws_sns_topic.budget_alerts.arn
      }
    ]
  })
}

resource "aws_sns_topic_subscription" "budget_email" {
  topic_arn = aws_sns_topic.budget_alerts.arn
  protocol  = "email"
  endpoint  = var.email_address
}

resource "aws_budgets_budget" "monthly" {
  name              = "monthly-budget"
  budget_type       = "COST"
  limit_amount      = tostring(var.monthly_budget_amount)
  limit_unit        = "USD"
  time_period_start = "2023-01-01_00:00"
  time_unit         = "MONTHLY"

  dynamic "notification" {
    for_each = var.alert_thresholds
    content {
      comparison_operator         = "GREATER_THAN"
      threshold                   = notification.value
      threshold_type              = "PERCENTAGE"
      notification_type           = "ACTUAL"
      subscriber_sns_topic_arns   = [aws_sns_topic.budget_alerts.arn]
    }
  }
}

output "sns_topic_arn" {
  value       = aws_sns_topic.budget_alerts.arn
  description = "The ARN of the SNS topic for budget alerts"
}
