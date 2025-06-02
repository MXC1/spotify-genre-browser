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
        type   = "log"
        x      = 0
        y      = 0
        width  = 12
        height = 6
        properties = {
          query   = "SOURCE '${var.log_group_name}'\n| filter event_id = \"SYS001\"\n| stats count(*) as total_events by bin(1d) as @timestamp"
          region  = "eu-west-2"
          title   = "SYS001 Events Count (Total)"
          view    = "timeSeries"
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
        x      = 12
        y      = 0
        width  = 12
        height = 6
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
