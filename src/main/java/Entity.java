import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.databind.annotation.JsonSerialize;
import org.apache.commons.lang3.RandomStringUtils;
import org.apache.commons.lang3.RandomUtils;

import java.math.BigDecimal;
import java.math.RoundingMode;

@JsonSerialize
public record Entity(Integer id, String message, BigDecimal price) {
    private static final ObjectMapper mapper = new ObjectMapper();

    public static final Entity factory() {
        Integer id = RandomUtils.nextInt();
        String message = RandomStringUtils.randomAlphabetic(20);
        BigDecimal price = new BigDecimal(RandomUtils.nextDouble(0.00D, 100000.00D))
                .setScale(2, RoundingMode.HALF_UP);
        return new Entity(id, message, price);
    }

    public String toJson() {
        try {
            return mapper.writeValueAsString(this);
        } catch (JsonProcessingException e) {
            throw new RuntimeException(e);
        }
    }
}
