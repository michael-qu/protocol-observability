########################################################################################
#                     Invoke            Publish              Send Emails
# CloudWatch Alarms ----------> Lambda ---------> SNS Topic -------------> Subscribers
#     (TVL/TMS)      Permission          Policy       ^      Subscription
#         |                                           |
#         |                   Publish                 |
#         |-------------------------------------------|
#                             Policy
########################################################################################

locals {
  email_list = [
    "michael.lb.qu@hotmail.com"
  ]
}

resource "aws_sns_topic" "anomaly_alert_topic" {
  name = "${local.function_name}-anomaly-alert"
}

data "aws_iam_policy_document" "anomaly_alert_policy" {
  statement {
    sid    = "AllowCloudWatchAlarmsToPublish"
    effect = "Allow"
    actions = [
      "SNS:Publish",
    ]
    principals {
      # Allow CloudWatch Alarms
      type = "Service"
      identifiers = [
        "cloudwatch.amazonaws.com",
      ]
    }
    resources = [
      aws_sns_topic.anomaly_alert_topic.arn,
    ]
  }

  # statement {
  #   sid    = "AllowLambdaToPublish"
  #   effect = "Allow"
  #   actions = [
  #     "SNS:Publish",
  #   ]
  #   principals {
  #     # Allow Lambda Function
  #     type = "AWS"
  #     identifiers = [
  #       aws_lambda_function.this.arn,
  #     ]
  #   }
  #   resources = [
  #     aws_sns_topic.anomaly_alert_topic.arn,
  #   ]
  # }
}

resource "aws_sns_topic_policy" "anomaly_alert_policy" {
  arn    = aws_sns_topic.anomaly_alert_topic.arn
  policy = data.aws_iam_policy_document.anomaly_alert_policy.json
}

# Delivers messages via SMTP to achieve A2P messaging, partially supported by Terraform
# If the subscription is not confirmed,
# either through automatic confirmation or means outside of Terraform
# (e.g., clicking on a "Confirm Subscription" link in an email),
# Terraform cannot delete / unsubscribe the subscription.
# Attempting to destroy an unconfirmed subscription
# will remove the aws_sns_topic_subscription from Terraform's state
# but will not remove the subscription from AWS.
resource "aws_sns_topic_subscription" "anomaly_alert_topic_email_subscriptions" {
  for_each = toset(local.email_list)

  topic_arn = aws_sns_topic.anomaly_alert_topic.arn
  protocol  = "email"
  endpoint  = each.value
  depends_on = [
    aws_sns_topic_policy.anomaly_alert_policy
  ]
}

# Allow Lambda function to call the SNS:Publish action
data "aws_iam_policy_document" "sns_policy" {
  statement {
    effect = "Allow"
    actions = [
      "SNS:Publish",
    ]
    resources = [
      "*",
    ]
  }
}

resource "aws_iam_policy" "sns_policy" {
  name        = "${local.function_name}-sns-policy"
  description = "Policy to allow Lambda function to publish to SNS topic"
  policy      = data.aws_iam_policy_document.sns_policy.json
}

# Grant the permission to the Lambda function's execution role
resource "aws_iam_role_policy_attachment" "lambda_sns_publish_permission" {
  role       = aws_iam_role.this.name
  policy_arn = aws_iam_policy.sns_policy.arn
}