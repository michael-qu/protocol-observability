import { DynamoDBClient } from "@aws-sdk/client-dynamodb";
import { PutCommand, DynamoDBDocumentClient } from "@aws-sdk/lib-dynamodb";

const client = new DynamoDBClient({});
const docClient = DynamoDBDocumentClient.from(client);

async function PutItem(
  tableName: string,
  key: string,
  value: bigint,
): Promise<void> {
  // Get the current timestamp
  const currentTimeStamp = new Date().toISOString();

  const command = new PutCommand({
    TableName: tableName,
    Item: {
      BlockType: key,
      BlockNumber: value,
      TimeStamp: currentTimeStamp,
    },
  });

  await docClient.send(command);
}

export { PutItem };
