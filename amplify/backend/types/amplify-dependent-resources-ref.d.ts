export type AmplifyDependentResourcesAttributes = {
  "api": {
    "feedbackAPI": {
      "ApiId": "string",
      "ApiName": "string",
      "RootUrl": "string"
    }
  },
  "function": {
    "feedbackLambda": {
      "Arn": "string",
      "LambdaExecutionRole": "string",
      "LambdaExecutionRoleArn": "string",
      "Name": "string",
      "Region": "string"
    }
  },
  "storage": {
    "feedbackTable": {
      "Arn": "string",
      "Name": "string",
      "PartitionKeyName": "string",
      "PartitionKeyType": "string",
      "Region": "string",
      "SortKeyName": "string",
      "SortKeyType": "string",
      "StreamArn": "string"
    }
  }
}