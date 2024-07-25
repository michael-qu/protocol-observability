data "aws_region" "current" {}

locals {
  namespace  = "Contract-Metrics"
  aws_region = data.aws_region.current.name
  symbols    = ["IronUSDC", "IronUSDT", "IronWETH", "IronezETH", "IronweETH", "IronwrsETH", "IronMBTC", "IronweETHmode", "IronMODE"]
  metrics    = ["Revenue", "TVL", "Deposit", "Debt", "TMS"]
}

resource "aws_cloudwatch_dashboard" "main" {
  for_each = toset(local.symbols)

  dashboard_name = "${local.function_name}-${each.value}-dashboard"

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
              [local.namespace, "${each.value} ${metric}", metric, each.value]
            ],
            "region" : local.aws_region
          }
        }
      ]
    ])
  })
}
