variable "log_group_name" {
  description = "Name of the CloudWatch Log Group to monitor"
  type        = string
}

variable "env" {
  description = "Environment name"
  type        = string
}

resource "aws_cloudwatch_dashboard" "main" {
  dashboard_name = "application-monitoring-${var.env}"
  dashboard_body = jsonencode({
    widgets = [
      {
        type   = "metric"
        x      = 0
        y      = 0
        width  = 12
        height = 6

        properties = {
          view = "timeSeries"
          metrics = [
            [
              "Custom/Application",
              "EventIdSYS001Count-${var.env}"
            ]
          ]
          region = "eu-west-2"
          title  = "SYS001 Events Count"
          period = 300
          stat   = "Sum"
        }
      }
    ]
  })
}

resource "aws_cloudwatch_log_metric_filter" "sys001_count" {
  name           = "EventIdSYS001Count-${var.env}"
  pattern        = "{ $.event_id = \"SYS001\" }"
  log_group_name = var.log_group_name

  metric_transformation {
    name          = "EventIdSYS001Count-${var.env}"
    namespace     = "Custom/Application"
    value         = "1"
    default_value = 0
    unit          = "Count"
  }
}
