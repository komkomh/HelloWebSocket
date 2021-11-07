const AWS = require('aws-sdk');
const docClient = new AWS.DynamoDB.DocumentClient();
const TABLE_NAME = process.env.TABLE_NAME;
const OPERATION_IPS = process.env.OPERATION_IPS;

exports.handler = async (event) => {
  try {
    // ログを出力する
    console.info(event);

    // 環境変数が設定れさていなければ
    if (!TABLE_NAME || !OPERATION_IPS) {
      // 500エラーとする
      console.error("Invalid environment variable.");
      return {statusCode: 500, body: 'Failed to connect: Invalid environment variable.'};
    }

    // 運用IPでなければ
    if (!OPERATION_IPS.split(',').includes(event.requestContext.identity.sourceIp)) {
      // DynamoDBから接続情報を取得する
      const response = await docClient.query({
        TableName: TABLE_NAME,
        KeyConditionExpression: "ip = :hashKey",
        ExpressionAttributeValues: {":hashKey": event.requestContext.identity.sourceIp}
      }).promise();

      // 3接続目であれば
      if (response.Items.length >= 2) {
        // 403エラーとする
        console.info("Too many Connection: " + event.requestContext.identity.sourceIp);
        return {statusCode: 403, body: 'Failed to connect: Too many Connection.'};
      }
    }

    // 2時間後を期限切れとする
    const connectedAt = parseInt(event.requestContext.connectedAt);
    const expirationAtMs = connectedAt + (1000 * 60 * 60 * 2); // 2時間後を指定
    const expirationAt = Math.trunc(expirationAtMs / 1000); // ミリ秒を秒に変換

    // 接続情報を保存する
    await docClient.put({
      TableName: TABLE_NAME,
      Item: {
        'ip': event.requestContext.identity.sourceIp,
        'cid': event.requestContext.connectionId,
        'connectedAt': connectedAt,
        'expirationAt': expirationAt
      }
    }).promise();

    // 200を返却する
    return {statusCode: 200, body: "connect"};
  } catch (e) {
    // 500エラー
    console.error(e);
    return {statusCode: 500, body: 'Failed to connect: System error.'};
  }
};
