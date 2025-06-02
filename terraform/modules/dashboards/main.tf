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
          title  = "SYS001 Events Count (Total)"
          period = 86400
          stat   = "Sum"
        }
      },
      {
        type   = "log"
        x      = 0
        y      = 6
        width  = 12
        height = 6
        properties = {
          query = "SOURCE '${var.log_group_name}'\n| filter event_id = \"SYS001\"\n| stats count_distinct(session_id) as distinct_sessions by bin(1d) as @timestamp"
          region = "eu-west-2"
          title  = "SYS001 Distinct Sessions Over Time"
          view   = "line"
        }
      },
      {
        type   = "log"
        x      = 0
        y      = 12
        width  = 24
        height = 8
        properties = {
          query = "SOURCE '${var.log_group_name}'\n| filter level = \"ERROR\"\n| stats count(*) as count by bin(1d) as timestamp, event_id, message\n| sort by timestamp desc\n| limit 100"
          region = "eu-west-2"
          title  = "Global Errors (Daily)"
          view   = "table"
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

resource "aws_cloudwatch_log_metric_filter" "error_count" {
  name           = "GlobalErrorCount-${var.env}"
  pattern        = "{ $.level = \"ERROR\" }"
  log_group_name = var.log_group_name

  metric_transformation {
    name          = "GlobalErrorCount-${var.env}"
    namespace     = "Custom/Application"
    value         = "1"
    default_value = 0
    unit          = "Count"
  }
}
