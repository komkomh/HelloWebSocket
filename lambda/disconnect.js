const AWS = require('aws-sdk');
const docClient = new AWS.DynamoDB.DocumentClient();
const TABLE_NAME = process.env.TABLE_NAME;

exports.handler = async (event, context, callback) => {
  try {
    // ログを出力する
    console.log(event);

    // 環境変数が設定れさていなければ
    if (!TABLE_NAME) {
      // 500エラーとする
      console.error("Invalid environment variable.");
      callback(null, {statusCode: 500, body: 'Failed to disconnect: Invalid environment variable.'});
      return;
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
    callback(null, {statusCode: 200, body: "connect"});
  } catch (e) {
    callback(null, {statusCode: 500, body: 'Failed to disconnect: ' + JSON.stringify(e)});
  }
};
