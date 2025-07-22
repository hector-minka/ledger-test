package com.minka.security;

import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.databind.SerializationFeature;
import com.fasterxml.jackson.databind.node.ObjectNode;
import com.fasterxml.jackson.databind.module.SimpleModule;
import com.fasterxml.jackson.databind.ser.std.ToStringSerializer;
import java.nio.charset.StandardCharsets;
import java.security.MessageDigest;

public class HashUtils {
    private static final ObjectMapper mapper = new ObjectMapper()
            .configure(SerializationFeature.ORDER_MAP_ENTRIES_BY_KEYS, true);

    public static String serializeData(Object data) throws JsonProcessingException {
        return mapper.writeValueAsString(data);
    }

    public static String createHash(Object data) throws Exception {
        String serialized = serializeData(data);
        MessageDigest digest = MessageDigest.getInstance("SHA-256");
        byte[] hash = digest.digest(serialized.getBytes(StandardCharsets.UTF_8));
        return bytesToHex(hash);
    }

    public static String createSignatureDigest(String dataHash, Object signatureCustom) throws Exception {
        String serializedCustom = signatureCustom != null ? serializeData(signatureCustom) : "";
        MessageDigest digest = MessageDigest.getInstance("SHA-256");
        byte[] hash = digest.digest((dataHash + serializedCustom).getBytes(StandardCharsets.UTF_8));
        return bytesToHex(hash);
    }

    private static String bytesToHex(byte[] bytes) {
        StringBuilder sb = new StringBuilder();
        for (byte b : bytes) {
            sb.append(String.format("%02x", b));
        }
        return sb.toString();
    }
} 