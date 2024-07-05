resource "aws_cloudwatch_log_group" "this" {
  name              = "/aws/lambda/${local.function_name}"
  retention_in_days = 365
}


resource "aws_cloudwatch_event_rule" "scheduled" {
  name        = "${local.function_name}-lambda-trigger"
  description = "Event that triggers Lambda function"
  # We can reduce the interval according to the execution duration of the Lambda function
  schedule_expression = "rate(2 minutes)"

  state = "ENABLED"
}

resource "aws_cloudwatch_event_target" "scheduled_lambda" {
  rule = aws_cloudwatch_event_rule.scheduled.name
  arn  = aws_lambda_function.this.arn
}

resource "aws_lambda_permission" "allow_cloudwatch" {
  statement_id  = "AllowExecutionFromCloudWatch"
  action        = "lambda:InvokeFunction"
  function_name = aws_lambda_function.this.function_name
  principal     = "events.amazonaws.com"
  source_arn    = aws_cloudwatch_event_rule.scheduled.arn
}