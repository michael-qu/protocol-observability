# https://docs.aws.amazon.com/AWSCloudFormation/latest/UserGuide/aws-resource-cloudwatch-alarm.html
locals {
  # Based on a standard deviation. Higher number means thicker band, lower number means thinner band.
  anomaly_detection_threshold = 1
}

resource "aws_cloudwatch_metric_alarm" "tvl_anomaly_detection" {
  for_each = { for symbol in local.symbols : symbol => symbol }

  alarm_name        = "${local.metrics[1]}-${each.value}-alarm"
  alarm_description = "Alarm of ${each.value} ${local.metrics[1]} based on anomaly detection model"

  actions_enabled = true

  ok_actions = []
  # Send email when this alarm transitions into an ALARM state
  alarm_actions = [
    aws_sns_topic.anomaly_alert_topic.arn,
  ]
  insufficient_data_actions = []

  # (Required) The number of the most recent periods, or data points, to evaluate when determining alarm state.
  evaluation_periods = 1
  # (Optional) The number of datapoints that must be breaching to trigger the alarm
  datapoints_to_alarm = 1
  # ID of the ANOMALY_DETECTION_BAND function
  threshold_metric_id = "ad1"
  comparison_operator = "LessThanLowerOrGreaterThanUpperThreshold"
  treat_missing_data  = "ignore"

  metric_query {
    id          = "m1"
    return_data = "true"
    metric {
      metric_name = "${each.value} ${local.metrics[1]}"
      namespace   = local.namespace
      period      = 3600
      stat        = "Average"
      unit        = "None"

      dimensions = {
        # The below interpolation-only expressions is deprecated
        # "${local.metrics[1]}" = local.symbols[0]
        TVL = each.value
      }
    }
  }

  metric_query {
    id          = "ad1"
    expression  = format("ANOMALY_DETECTION_BAND(m1, %d)", local.anomaly_detection_threshold)
    label       = "${each.value} ${local.metrics[1]} (expected)"
    return_data = "true"
  }
}