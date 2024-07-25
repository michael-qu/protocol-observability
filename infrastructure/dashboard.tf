data "aws_region" "current" {}

locals {
  namespace  = "Contract-Metrics"
  aws_region = data.aws_region.current.name
  symbol     = "IronUSDC"
  metrics    = ["Revenue", "TVL", "Deposit", "Debt", "TMS"]
}

resource "aws_cloudwatch_dashboard" "main" {
  dashboard_name = "${local.function_name}-${local.symbol}-dashboard"

  dashboard_body = jsonencode({
    "widgets" : flatten([
      for idx, metric in local.metrics : [
        {
          "height" : 6,
          "width" : 6,
          "y" : floor(idx / 4) * 6,
          "x" : (idx % 4) * 6,
          "type" : "metric",
          "properties" : {
            "view" : "timeSeries",
            "stacked" : false,
            "metrics" : [
              [local.namespace, "${local.symbol} ${metric}", metric, local.symbol]
            ],
            "region" : local.aws_region
          }
        }
      ]
    ])
  })
}
