resource "aws_cloudwatch_metric_alarm" "tvl_ironusdc_anomaly_detection" {
  alarm_name        = "${local.metrics[1]}-${local.symbols[0]}-alarm"
  alarm_description = "Alarm of ${local.symbols[0]} ${local.metrics[1]} based on anomaly detection model"

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
  # (Optional) If this is an alarm based on an anomaly detection model, make this value match the ID of the ANOMALY_DETECTION_BAND function.
  threshold_metric_id = "ad1"
  comparison_operator = "LessThanLowerOrGreaterThanUpperThreshold"
  treat_missing_data  = "ignore"

  metric_query {
    id          = "m1"
    return_data = "true"
    metric {
      metric_name = "${local.symbols[0]} ${local.metrics[1]}"
      namespace   = local.namespace
      period      = 3600
      stat        = "Average"
      unit        = "None"

      dimensions = {
        # "${local.metrics[1]}" = local.symbols[0]
        TVL = local.symbols[0]
      }
    }
  }

  metric_query {
    id          = "ad1"
    expression  = "ANOMALY_DETECTION_BAND(m1, 1)"
    label       = "${local.symbols[0]} ${local.metrics[1]} (expected)"
    return_data = "true"
  }
}


