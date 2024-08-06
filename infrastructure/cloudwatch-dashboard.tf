data "aws_region" "current" {}

locals {
  namespace     = "Contract-Metrics"
  aws_region    = data.aws_region.current.name
  symbols       = ["Total", "IronUSDC", "IronUSDT", "IronWETH", "IronezETH", "IronweETH", "IronwrsETH", "IronMBTC", "IronweETHmode", "IronMODE"]
  metrics       = ["Revenue", "TVL", "Deposit", "Debt", "TMS"]
  alarm_metrics = ["TVL", "TMS"]
}

resource "aws_cloudwatch_dashboard" "state_variables" {
  for_each = toset(local.symbols)

  dashboard_name = "${local.function_name}-${each.value}-dashboard"

  dashboard_body = jsonencode({
    "widgets" : flatten([
      for idx, metric in local.metrics : [
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
              [local.namespace, "${each.value} ${metric}", metric, each.value]
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
              [local.namespace, "${each.value} ${metric}", metric, each.value]
            ],
            "region" : local.aws_region
          }
        },
      ]
    ])
  })
}

resource "aws_cloudwatch_dashboard" "tvl_alarms_dashboard" {
  dashboard_name = "${local.function_name}-${local.alarm_metrics[0]}-alarms-dashboard"

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
            "title" : "${local.alarm_metrics[0]}-${symbol}-alarm",
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
  dashboard_name = "${local.function_name}-${local.alarm_metrics[1]}-alarms-dashboard"

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
            "title" : "${local.alarm_metrics[1]}-${symbol}-alarm",
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