data "aws_region" "current" {}

locals {
  namespace  = "Contract-Metrics"
  aws_region = data.aws_region.current.name
}

resource "aws_cloudwatch_dashboard" "main" {
  dashboard_name = "${local.function_name}-dashboard"

  dashboard_body = jsonencode({
    "widgets" : [
      {
        "height" : 6,
        "width" : 6,
        "y" : 0,
        "x" : 0,
        "type" : "metric",
        "properties" : {
          "view" : "timeSeries",
          "stacked" : false,
          "metrics" : [
            [local.namespace, "IronUSDC TVL", "TVL", "USDC"]
          ],
          "region" : local.aws_region
        }
      },
      {
        "height" : 6,
        "width" : 6,
        "y" : 0,
        "x" : 6,
        "type" : "metric",
        "properties" : {
          "view" : "timeSeries",
          "stacked" : false,
          "metrics" : [
            [local.namespace, "IronUSDC Revenue", "Revenue", "USDC"]
          ],

          "region" : local.aws_region,
          # "period": 300,
          # "stat": "Average"
        }
      },
      {
        "height" : 6,
        "width" : 6,
        "y" : 0,
        "x" : 12,
        "type" : "metric",
        "properties" : {
          "view" : "timeSeries",
          "stacked" : false,
          "metrics" : [
            [local.namespace, "IronUSDC Deposit", "Deposit", "USDC"]
          ],
          "region" : local.aws_region
        }
      },
      {
        "height" : 6,
        "width" : 6,
        "y" : 0,
        "x" : 18,
        "type" : "metric",
        "properties" : {
          "view" : "timeSeries",
          "stacked" : false,
          "metrics" : [
            [local.namespace, "IronUSDC Debt", "Debt", "USDC"]
          ],
          "region" : local.aws_region
        }
      },
      {
        "height" : 6,
        "width" : 6,
        "y" : 6,
        "x" : 0,
        "type" : "metric",
        "properties" : {
          "view" : "timeSeries",
          "stacked" : false,
          "metrics" : [
            [local.namespace, "IronUSDC TMS", "TMS", "USDC"]
          ],
          "region" : local.aws_region
        }
      }
    ]
  })
}