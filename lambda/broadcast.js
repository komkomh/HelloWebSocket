const AWS = require('aws-sdk');
const docClient = new AWS.DynamoDB.DocumentClient();

const TABLE_NAME = process.env.TABLE_NAME;
const apiGateway = new AWS.ApiGatewayManagementApi({
  apiVersion: "2018-11-29",
  endpoint: process.env.ENDPOINT
});

exports.handler = async (event) => {
  try {
    // ログを出力する
    console.info(event);

    // 環境変数が設定れさていなければ
    if (!TABLE_NAME) {
      // 500エラーとする
      console.error("Invalid environment variable.");
      return {statusCode: 500, body: 'Failed to broadcast: Invalid environment variable.'};
    }

    // DynamoDBから接続情報を取得する
    const response = await docClient.scan({TableName: TABLE_NAME,}).promise();

    // 全ての接続先にメッセージを送信する
    const promises = response.Items.map(async item => await apiGateway.postToConnection({
      ConnectionId: item.cid,
      Data: JSON.stringify(event)
    }).promise());
    await Promise.all(promises);

    // 200を返却する
    return {statusCode: 200, body: "broadcast"};
  } catch (e) {
    // 500エラー
    console.error(e);
    return {statusCode: 500, body: 'Failed to broadcast: System error.'};
  }
};
