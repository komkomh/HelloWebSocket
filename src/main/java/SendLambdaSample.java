import com.amazonaws.auth.profile.ProfileCredentialsProvider;
import com.amazonaws.regions.Regions;
import com.amazonaws.services.lambda.AWSLambda;
import com.amazonaws.services.lambda.AWSLambdaAsyncClientBuilder;
import com.amazonaws.services.lambda.model.InvokeRequest;
import com.amazonaws.services.lambda.model.InvokeResult;

import java.util.Date;

public class SendLambdaSample {
    private static final AWSLambda asyncLambda = AWSLambdaAsyncClientBuilder.standard()
            .withCredentials(new ProfileCredentialsProvider("sandbox"))
            .withRegion(Regions.AP_NORTHEAST_1).build();

    public static void main(String[] args) {
        for (int i = 0; true; i++) {
            Date begin = new Date();
            System.out.println("id = " + i);
            Integer responseCode = invokeLambdaFunction(Entity.factory(i).toJson());
            Long diff = new Date().getTime() - begin.getTime();
            System.out.println("status = " + responseCode + ", ms = " + diff);
            sleep(1000L);
        }
    }

    private static Integer invokeLambdaFunction(String json) {
        InvokeRequest invokeRequest = new InvokeRequest()
                .withFunctionName("hello-websocket-broadcast")
                .withPayload(json);
        InvokeResult invokeResult = asyncLambda.invoke(invokeRequest);
        return invokeResult.getStatusCode();
    }

    private static void sleep(Long sleep) {
        try {
            Thread.sleep(sleep);
        } catch (InterruptedException e) {
            throw new RuntimeException(e);
        }
    }
}
