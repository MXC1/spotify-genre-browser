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
          query   = "SOURCE '${var.log_group_name}'\n| filter event_id = \"SYS001\"\n| stats count(*) as total_events, count_distinct(session_id) as distinct_sessions by bin(1d) as @timestamp"
          region  = "eu-west-2"
          title   = "SYS001 Events Summary"
          view    = "table"
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
      },
      {
        type   = "log"
        x      = 0
        y      = 6
        width  = 12
        height = 6
        properties = {
          query = "SOURCE '${var.log_group_name}'\n| filter event_id = \"NAV001\"\n| stats count(*) as count by bin(1d) as timestamp, path\n| sort by timestamp desc, count desc\n| limit 100"
          region = "eu-west-2"
          title  = "Most Visited Pages (Daily)"
          view   = "table"
        }
      }
    ]
  })
}
