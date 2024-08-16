import { SNSClient, PublishCommand } from "@aws-sdk/client-sns";

const snsClient = new SNSClient({});

// Sends a message to an Amazon SNS topic
// Amazon SNS delivers the message to each endpoint that is subscribed to the topic.
// You can publish messages only to topics and endpoints in the same Amazon Web Services Region.

// /**
//  * @param {string | Record<string, any>} message - The message to send. Can be a plain string or an object
//  *                                                 if you are using the `json` `MessageStructure`.
//  * @param {string} topicArn - The ARN of the topic to which you would like to publish.
//  */

async function PublishMessage(
  subject: string,
  message: string,
  topicArn: string,
): Promise<void> {
  const input = {
    // PublishInput
    TopicArn: topicArn,
    // TargetArn: "STRING_VALUE",
    // PhoneNumber: "STRING_VALUE",
    Message: message, // required
    Subject: subject,
    // MessageStructure: "STRING_VALUE",
    // MessageAttributes: { // MessageAttributeMap
    //   "<keys>": { // MessageAttributeValue
    //     DataType: "STRING_VALUE", // required
    //     StringValue: "STRING_VALUE",
    //     BinaryValue: new Uint8Array(), // e.g. Buffer.from("") or new TextEncoder().encode("")
    //   },
    // },
    // MessageDeduplicationId: "STRING_VALUE",
    // MessageGroupId: "STRING_VALUE",
  };
  const command = new PublishCommand(input);
  const response = await snsClient.send(command);
  console.log(response);
}

export { PublishMessage };
