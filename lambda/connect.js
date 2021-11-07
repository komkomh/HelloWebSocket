const AWS = require('aws-sdk');
const docClient = new AWS.DynamoDB.DocumentClient();
const TABLE_NAME = process.env.TABLE_NAME;
const OPERATION_IPS = process.env.OPERATION_IPS;

exports.handler = async (event, context, callback) => {
  try {
    // ログを出力する
    console.log(event);

    // 環境変数が設定れさていなければ
    if (!TABLE_NAME || !OPERATION_IPS) {
      // 500エラーとする
      console.error("Invalid environment variable.");
      callback(null, {statusCode: 500, body: 'Failed to connect: Invalid environment variable.'});
      return;
    }

    // 運用IPでなければ
    if (!OPERATION_IPS.split(',').includes(event.requestContext.identity.sourceIp)) {
      // DynamoDBから接続済みIPを取得して
      const response = await docClient.query({
        TableName: TABLE_NAME,
        KeyConditionExpression: "ip = :hashKey",
        ExpressionAttributeValues: {":hashKey": event.requestContext.identity.sourceIp}
      }).promise();

      // 既に2接続されていれば
      if (response.Items.length >= 2) {
        // 403エラーとする
        callback(null, {statusCode: 403, body: 'Failed to connect: Too many Connection.'});
        return;
      }
    }

    // 2時間後を期限切れとする
    const connectedAt = parseInt(event.requestContext.connectedAt);
    const expirationAtMs = parseInt(connectedAt) + (1000 * 60 * 60 * 2); // 2時間後を指定
    const expirationAt = Math.trunc(expirationAtMs / 1000); // ミリ秒を秒に変換
    console.log('expirationAt = ' + expirationAt);

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
    callback(null, {statusCode: 200, body: "connect"});
  } catch (e) {
    callback(null, {statusCode: 500, body: 'Failed to connect: ' + JSON.stringify(e)});
  }
};
