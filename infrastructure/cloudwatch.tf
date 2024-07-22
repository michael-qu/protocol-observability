resource "aws_cloudwatch_log_group" "this" {
  name              = "/aws/lambda/${local.function_name}"
  retention_in_days = 365
}

locals {
  triggers = {
    "raw-transfer-event" = {
      operation = "fetchRawTransferEvent"
    },
    tvl = {
      operation = "fetchTVL"
    },
    revenue = {
      operation = "fetchRevenue"
    },
    deposit = {
      operation = "fetchDeposit"
    },
    debt = {
      operation = "fetchDebt"
    },
    tms = {
      operation = "fetchTMS"
    }
  }
}

resource "aws_cloudwatch_event_rule" "lambda_triggers" {
  for_each            = local.triggers
  name                = "${local.function_name}-fetch-${each.key}-trigger"
  description         = "Event that triggers Lambda function to fetch ${each.key}"
  schedule_expression = "rate(5 minutes)"
  state               = "ENABLED"
  # state = var.environment == "development" ? "DISABLED" : "ENABLED"
}

resource "aws_cloudwatch_event_target" "lambda_targets" {
  for_each = aws_cloudwatch_event_rule.lambda_triggers
  rule     = each.value.name
  arn      = aws_lambda_function.this.arn

  input = jsonencode({
    operation = local.triggers[each.key].operation
  })
}

resource "aws_lambda_permission" "allow_cloudwatch" {
  for_each = aws_cloudwatch_event_rule.lambda_triggers

  statement_id  = "AllowExecutionFromCloudWatch-${each.key}"
  action        = "lambda:InvokeFunction"
  function_name = aws_lambda_function.this.function_name
  principal     = "events.amazonaws.com"
  source_arn    = each.value.arn

  depends_on = [
    aws_cloudwatch_event_rule.lambda_triggers
  ]
}

# Grant lambda function with permission to push metric to CloudWatch
resource "aws_iam_policy" "cloudwatch_policy" {
  name        = "${local.function_name}_cloudwatch_policy"
  description = "Policy for CloudWatch access"

  policy = jsonencode({
    Version = "2012-10-17",
    Statement = [
      {
        Action = [
          "cloudwatch:PutMetricData"
        ],
        Effect   = "Allow",
        Resource = "*"
      }
    ]
  })
}

resource "aws_iam_role_policy_attachment" "attach_cloudwatch_policy" {
  role       = aws_iam_role.this.name
  policy_arn = aws_iam_policy.cloudwatch_policy.arn
}