import {
  CloudWatchClient,
  PutMetricDataCommand,
} from "@aws-sdk/client-cloudwatch";

async function PublishMetric(
  nameSpace: string,
  dimensionName: string,
  dimensionValueName: string,
  metricName: string,
  value: number,
): Promise<void> {
  const client = new CloudWatchClient({});
  const command = new PutMetricDataCommand({
    MetricData: [
      {
        MetricName: metricName,
        Dimensions: [
          {
            Name: dimensionName,
            Value: dimensionValueName,
          },
        ],
        Unit: "None",
        Value: value,
      },
    ],
    Namespace: nameSpace,
  });

  await client.send(command);

  console.log(`Value ${value} is published to CloudWatch as ${metricName}.`);
}

export { PublishMetric };
