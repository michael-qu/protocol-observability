# https://docs.aws.amazon.com/AWSCloudFormation/latest/UserGuide/aws-resource-cloudwatch-alarm.html
locals {
  # The length of time to use to evaluate the metric, in seconds
  # As per Nyquist Theorem, the period of anomaly detection should be at least 2 * metric's period
  # https://www.quora.com/How-frequent-does-time-series-data-have-to-be-for-anomaly-detection-to-make-sense
  alert_period = 7200
  # Based on a standard deviation. Higher number means thicker band, lower number means thinner band.
  anomaly_detection_threshold = 1
  # (Required) The number of the most recent periods, or data points, to evaluate when determining alarm state.
  evaluation_periods = 1
  # (Optional) The number of datapoints that must be breaching to trigger the alarm
  datapoints_to_alarm = 1
}

resource "aws_cloudwatch_metric_alarm" "tvl_alarms" {
  for_each = { for symbol in local.symbols : symbol => symbol }

  alarm_name        = "${local.alarm_dimensions[0]}-${each.value}-alarm"
  alarm_description = "Alarm of ${each.value} ${local.dimensions[1]} based on anomaly detection model"

  actions_enabled = true

  ok_actions = []
  # Send email when this alarm transitions into an ALARM state
  alarm_actions = [
    aws_sns_topic.anomaly_alert_topic.arn,
  ]
  insufficient_data_actions = []

  evaluation_periods  = local.evaluation_periods
  datapoints_to_alarm = local.datapoints_to_alarm
  # ID of the ANOMALY_DETECTION_BAND function
  threshold_metric_id = "ad1"
  comparison_operator = "LessThanLowerOrGreaterThanUpperThreshold"
  treat_missing_data  = "missing"

  metric_query {
    id          = "m1"
    return_data = "true"
    metric {
      metric_name = "${each.value} ${local.alarm_dimensions[0]}"
      namespace   = local.namespace
      period      = local.alert_period
      stat        = "Average"
      unit        = "None"

      dimensions = {
        TVL = each.value
      }
    }
  }

  metric_query {
    id          = "ad1"
    expression  = format("ANOMALY_DETECTION_BAND(m1, %d)", local.anomaly_detection_threshold)
    label       = "${each.value} ${local.alarm_dimensions[0]} (expected)"
    return_data = "true"
  }
}

resource "aws_cloudwatch_metric_alarm" "tms_alarms" {
  for_each = { for symbol in local.symbols : symbol => symbol }

  alarm_name        = "${local.alarm_dimensions[1]}-${each.value}-alarm"
  alarm_description = "Alarm of ${each.value} ${local.alarm_dimensions[1]} based on anomaly detection model"

  actions_enabled = true

  ok_actions = []
  # Send email when this alarm transitions into an ALARM state
  alarm_actions = [
    aws_sns_topic.anomaly_alert_topic.arn,
  ]
  insufficient_data_actions = []

  evaluation_periods  = local.evaluation_periods
  datapoints_to_alarm = local.datapoints_to_alarm
  # ID of the ANOMALY_DETECTION_BAND function
  threshold_metric_id = "ad1"
  comparison_operator = "LessThanLowerOrGreaterThanUpperThreshold"
  treat_missing_data  = "missing"

  metric_query {
    id          = "m1"
    return_data = "true"
    metric {
      metric_name = "${each.value} ${local.alarm_dimensions[1]}"
      namespace   = local.namespace
      period      = local.alert_period
      stat        = "Average"
      unit        = "None"

      dimensions = {
        TMS = each.value
      }
    }
  }

  metric_query {
    id          = "ad1"
    expression  = format("ANOMALY_DETECTION_BAND(m1, %d)", local.anomaly_detection_threshold)
    label       = "${each.value} ${local.alarm_dimensions[1]} (expected)"
    return_data = "true"
  }
}