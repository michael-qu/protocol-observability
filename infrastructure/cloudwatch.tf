resource "aws_cloudwatch_log_group" "this" {
  name              = "/aws/lambda/${local.function_name}"
  retention_in_days = 365
}

resource "aws_cloudwatch_event_rule" "fetch_raw_transfer_event" {
  name                = "${local.function_name}-fetchRawTransferEvent-trigger"
  description         = "Event that triggers Lambda function to fetch raw transfer events"
  schedule_expression = "rate(1 minute)"
  state               = "ENABLED"
}

resource "aws_cloudwatch_event_target" "fetch_raw_transfer_event_lambda" {
  rule = aws_cloudwatch_event_rule.fetch_raw_transfer_event.name
  arn  = aws_lambda_function.this.arn

  input = jsonencode({
    operation = "fetchRawTransferEvent"
  })
}

resource "aws_cloudwatch_event_rule" "fetch_tvl" {
  name                = "${local.function_name}-fetchTVL-trigger"
  description         = "Event that triggers Lambda function to fetch TVL"
  schedule_expression = "rate(2 minutes)"
  state               = "ENABLED"
}

resource "aws_cloudwatch_event_target" "fetch_tvl_lambda" {
  rule = aws_cloudwatch_event_rule.fetch_tvl.name
  arn  = aws_lambda_function.this.arn

  input = jsonencode({
    operation = "fetchTVL"
  })
}

resource "aws_cloudwatch_event_rule" "fetch_revenue" {
  name                = "${local.function_name}-fetchRevenue-trigger"
  description         = "Event that triggers Lambda function to fetch revenue"
  schedule_expression = "rate(3 minutes)"
  state               = "ENABLED"
}

resource "aws_cloudwatch_event_target" "fetch_revenue_lambda" {
  rule = aws_cloudwatch_event_rule.fetch_revenue.name
  arn  = aws_lambda_function.this.arn

  input = jsonencode({
    operation = "fetchRevenue"
  })
}

resource "aws_lambda_permission" "allow_cloudwatch" {
  for_each = {
    fetch_raw_transfer_event = aws_cloudwatch_event_rule.fetch_raw_transfer_event.arn
    fetch_tvl                = aws_cloudwatch_event_rule.fetch_tvl.arn
    fetch_revenue            = aws_cloudwatch_event_rule.fetch_revenue.arn
  }

  statement_id  = "AllowExecutionFromCloudWatch-${each.key}"
  action        = "lambda:InvokeFunction"
  function_name = aws_lambda_function.this.function_name
  principal     = "events.amazonaws.com"
  source_arn    = each.value
}
