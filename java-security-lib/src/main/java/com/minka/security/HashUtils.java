package com.minka.security;

import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.databind.SerializationFeature;
import java.nio.charset.StandardCharsets;
import java.security.MessageDigest;

// Utility class for hashing and serializing data
public class HashUtils {
    // ObjectMapper for stable JSON serialization (always sorts keys)
    private static final ObjectMapper mapper = new ObjectMapper()
            .configure(SerializationFeature.ORDER_MAP_ENTRIES_BY_KEYS, true);

    // Converts any Java object to a stable JSON string
    public static String serializeData(Object data) throws JsonProcessingException {
        return mapper.writeValueAsString(data);
    }

    // Creates a SHA-256 hash (hex string) of the serialized data
    public static String createHash(Object data) throws Exception {
        String serialized = serializeData(data); // Convert to JSON
        MessageDigest digest = MessageDigest.getInstance("SHA-256"); // Get SHA-256 digest
        byte[] hash = digest.digest(serialized.getBytes(StandardCharsets.UTF_8)); // Hash the JSON
        return bytesToHex(hash); // Convert to hex string
    }

    // Creates a SHA-256 hash (hex string) of the data hash + serialized custom signature info
    public static String createSignatureDigest(String dataHash, Object signatureCustom) throws Exception {
        String serializedCustom = signatureCustom != null ? serializeData(signatureCustom) : "";
        MessageDigest digest = MessageDigest.getInstance("SHA-256");
        byte[] hash = digest.digest((dataHash + serializedCustom).getBytes(StandardCharsets.UTF_8));
        return bytesToHex(hash);
    }

    // Helper to convert a byte array to a hex string
    private static String bytesToHex(byte[] bytes) {
        StringBuilder sb = new StringBuilder();
        for (byte b : bytes) {
            sb.append(String.format("%02x", b));
        }
        return sb.toString();
    }
} 