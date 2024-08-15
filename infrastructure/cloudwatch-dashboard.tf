data "aws_region" "current" {}

locals {
  namespace  = "Contract-Metrics"
  aws_region = data.aws_region.current.name
  symbols    = ["Total", "IronUSDC", "IronUSDT", "IronWETH", "IronezETH", "IronweETH", "IronwrsETH", "IronMBTC", "IronweETHmode", "IronMODE"]
  # Threshold for anomaly detection (visualized as a band in the dashboard), based on a standard deviation
  # Setting it to be 1 will generate a lot of false alarms, which is only for testing purpose
  # For tokens with larger market sizes (USDC, USDT, ETH, ezETH), threshold is smaller
  thresholds = [2, 2, 2, 2, 2, 5, 5, 5, 5, 5]
  # Map each symbol to its corresponding threshold
  symbol_threshold_map = { for idx, symbol in local.symbols : symbol => local.thresholds[idx] }
  dimensions           = ["Revenue", "TVL", "Deposit", "Debt", "TMS"]
  alarm_dimensions     = ["TVL", "TMS"]
}

resource "aws_cloudwatch_dashboard" "state_variables_dashboards" {
  for_each = toset(local.symbols)

  dashboard_name = "${local.function_name}-${each.value}-dashboard"

  dashboard_body = jsonencode({
    "widgets" : flatten([
      for idx, dimension in local.dimensions : [
        {
          "height" : 6,
          "width" : 4,
          "y" : 0,
          "x" : idx * 4,
          "type" : "metric",
          "properties" : {
            "view" : "timeSeries",
            "stacked" : false,
            "metrics" : [
              [local.namespace, "${each.value} ${dimension}", dimension, each.value]
            ],
            "region" : local.aws_region
          }
        },
        {
          "height" : 6,
          "width" : 4,
          "y" : 6,
          "x" : idx * 4,
          "type" : "metric",
          "properties" : {
            "view" : "singleValue",
            "stacked" : false,
            "metrics" : [
              [local.namespace, "${each.value} ${dimension}", dimension, each.value]
            ],
            "region" : local.aws_region
          }
        },
      ]
    ])
  })
}

resource "aws_cloudwatch_dashboard" "tvl_alarms_dashboard" {
  dashboard_name = "${local.function_name}-${local.alarm_dimensions[0]}-alarms-dashboard"

  dashboard_body = jsonencode({
    "widgets" : flatten([
      for idx, symbol in local.symbols : [
        {
          "height" : 6,
          "width" : 6,
          "y" : floor(idx / 4),
          "x" : (idx % 4) * 6,
          "type" : "metric",
          "properties" : {
            "title" : "${local.alarm_dimensions[0]}-${symbol}-alarm",
            "annotations" : {
              "alarms" : [
                aws_cloudwatch_metric_alarm.tvl_alarms[symbol].arn
              ]
            },
            "view" : "timeSeries",
            "stacked" : false,
            "type" : "chart"
          }
        }
      ]
    ])
  })
}

resource "aws_cloudwatch_dashboard" "tms_alarms_dashboard" {
  dashboard_name = "${local.function_name}-${local.alarm_dimensions[1]}-alarms-dashboard"

  dashboard_body = jsonencode({
    "widgets" : flatten([
      for idx, symbol in local.symbols : [
        {
          "height" : 6,
          "width" : 6,
          "y" : floor(idx / 4),
          "x" : (idx % 4) * 6,
          "type" : "metric",
          "properties" : {
            "title" : "${local.alarm_dimensions[1]}-${symbol}-alarm",
            "annotations" : {
              "alarms" : [
                aws_cloudwatch_metric_alarm.tms_alarms[symbol].arn
              ]
            },
            "view" : "timeSeries",
            "stacked" : false,
            "type" : "chart"
          }
        }
      ]
    ])
  })
}