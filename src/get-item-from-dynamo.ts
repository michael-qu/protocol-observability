import { DynamoDBClient } from "@aws-sdk/client-dynamodb";
import { DynamoDBDocumentClient, GetCommand } from "@aws-sdk/lib-dynamodb";

const client = new DynamoDBClient({});
const docClient = DynamoDBDocumentClient.from(client);

async function GetItem(
  tableName: string,
  pkName: string,
  key: string,
): Promise<DynamoDBResponse | undefined> {
  const command = new GetCommand({
    TableName: tableName,
    Key: {
      [pkName]: key,
    },
  });

  const response = await docClient.send(command);
  // console.log(response);
  return response as DynamoDBResponse;
}

export { GetItem };

interface DynamoDBResponse {
  $metadata: {
    httpStatusCode: number;
    requestId: string;
    extendedRequestId: string | undefined;
    cfId: string | undefined;
    attempts: number;
    totalRetryDelay: number;
  };
  // Item: any;
  Item: {
    BlockNumber: bigint;
    BlockType: string;
    TimeStamp: string;
  };
}
