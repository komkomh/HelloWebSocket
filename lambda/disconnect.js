const AWS = require('aws-sdk');
const docClient = new AWS.DynamoDB.DocumentClient();
const TABLE_NAME = process.env.TABLE_NAME;

exports.handler = async (event) => {
  try {
    // ログを出力する
    console.info(event);

    // 環境変数が設定れさていなければ
    if (!TABLE_NAME) {
      // 500エラーとする
      console.error("Invalid environment variable.");
      return {statusCode: 500, body: 'Failed to disconnect: Invalid environment variable.'};
    }

    // 接続情報を削除する
    await docClient.delete({
      TableName: TABLE_NAME,
      Key: {
        'ip': event.requestContext.identity.sourceIp,
        'cid': event.requestContext.connectionId
      }
    }).promise();

    // 200を返却する
    return {statusCode: 200, body: "connect"};
  } catch (e) {
    // 500エラー
    console.error(e);
    return {statusCode: 500, body: 'Failed to disconnect: System error.'};
  }
};
