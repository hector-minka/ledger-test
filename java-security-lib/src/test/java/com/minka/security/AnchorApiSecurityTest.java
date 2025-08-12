package com.minka.security;

import com.minka.security.HashUtils;
import com.minka.security.KeyUtils;
import com.minka.security.SignatureUtils;
import com.minka.security.JwtUtils;
import java.util.*;
import java.time.Instant;
import java.security.PrivateKey;

public class AnchorApiSecurityTest {
    public static void main(String[] args) throws Exception {
        // --- Signer and keys (from test-anchors-api.ts) ---
        final String SIGNER = "htorohn";
        final String PUBLIC_KEY = "YiY9jEkH3wldB7YWGvc/Ht2VgsYY7JU2OSSaE7DvtYw=";
        final String SECRET_KEY = "fiCwMZ406y4uzpCvB+bZZAemToHooagwLGn15We+m0s=";
        final String LEDGER = "payments-hub-hector-test";
        final String SERVER = "https://ldg-dev.one/api/v2";

        // --- Anchor data structure (based on test-anchors.ts) ---
        Map<String, Object> anchorData = new HashMap<>();
        anchorData.put("handle", "3123454333"); // Use a unique handle
        anchorData.put("target", "svgs:20359303@bancorojo.co");
        anchorData.put("symbol", "cop");
        anchorData.put("schema", "individual");
        
        // Custom fields for the anchor
        Map<String, Object> custom = new HashMap<>();
        custom.put("lastName", "Carrasquillo");
        custom.put("aliasType", "tel");
        custom.put("firstName", "Alejandra");
        custom.put("secondName", "Lourdes");
        custom.put("routingCode", "TFY");
        custom.put("documentType", "cc");
        custom.put("documentNumber", "1239374708");
        custom.put("secondLastName", "Palomo");
        custom.put("participantCode", "8224");
        anchorData.put("custom", custom);

        // --- signatureCustom (use ISO8601 timestamps) ---
        String nowIso = Instant.now().toString();
        Map<String, Object> signatureCustom = new HashMap<>();
        signatureCustom.put("moment", nowIso);
        signatureCustom.put("status", "active");
        signatureCustom.put("consented", nowIso);
        signatureCustom.put("received", nowIso);
        signatureCustom.put("dispatched", nowIso);
        signatureCustom.put("domain", null);

        // --- Key loading ---
        String derKeyPath = "htorohn-key.der";
        PrivateKey privateKey = KeyUtils.loadEd25519PrivateKeyFromDerFile(derKeyPath);
        String base64PublicKey = PUBLIC_KEY;

        // --- Hashing ---
        String hash = HashUtils.createHash(anchorData);
        System.out.println("ANCHOR HASH: " + hash);

        // --- Signature digest ---
        String signatureDigest = HashUtils.createSignatureDigest(hash, signatureCustom);
        System.out.println("SIGNATURE DIGEST: " + signatureDigest);

        // --- Ed25519 signature (Base64) ---
        byte[] signature = SignatureUtils.signEd25519(signatureDigest, privateKey);
        String signatureBase64 = SignatureUtils.toBase64(signature);
        System.out.println("SIGNATURE BASE64: " + signatureBase64);

        // --- JWT payload ---
        Map<String, Object> jwtPayload = new HashMap<>();
        jwtPayload.put("iss", SIGNER);
        jwtPayload.put("sub", "signer:" + SIGNER);
        jwtPayload.put("aud", LEDGER);
        long now = System.currentTimeMillis() / 1000L;
        jwtPayload.put("iat", now);
        jwtPayload.put("exp", now + 60);

        String jwt = JwtUtils.signJWT(jwtPayload, SECRET_KEY, base64PublicKey);
        System.out.println("JWT: " + jwt);

        // --- Build request object (as in TypeScript) ---
        Map<String, Object> proof = new HashMap<>();
        proof.put("method", "ed25519-v2");
        proof.put("custom", signatureCustom);
        proof.put("digest", signatureDigest);
        proof.put("public", base64PublicKey);
        proof.put("result", signatureBase64);
        
        Map<String, Object> meta = new HashMap<>();
        meta.put("labels", new String[]{"ndin:0801198607268"});
        meta.put("proofs", new Object[]{proof});
        
        Map<String, Object> request = new HashMap<>();
        request.put("data", anchorData);
        request.put("hash", hash);
        request.put("meta", meta);

        System.out.println("ANCHOR REQUEST: " + HashUtils.serializeData(request));
        System.out.println("JWT (for Authorization header): Bearer " + jwt);

        // --- HTTP POST to anchors endpoint ---
        String serverUrl = SERVER + "/anchors";
        String jsonRequest = HashUtils.serializeData(request);
        java.net.URL url = new java.net.URL(serverUrl);
        java.net.HttpURLConnection conn = (java.net.HttpURLConnection) url.openConnection();
        conn.setRequestMethod("POST");
        conn.setRequestProperty("Content-Type", "application/json");
        conn.setRequestProperty("x-ledger", LEDGER);
        conn.setRequestProperty("Authorization", "Bearer " + jwt);
        conn.setDoOutput(true);
        
        try (java.io.OutputStream os = conn.getOutputStream()) {
            byte[] input = jsonRequest.getBytes(java.nio.charset.StandardCharsets.UTF_8);
            os.write(input, 0, input.length);
        }
        
        int responseCode = conn.getResponseCode();
        System.out.println("RESPONSE CODE: " + responseCode);
        
        try (java.io.InputStream is = (responseCode < 400) ? conn.getInputStream() : conn.getErrorStream()) {
            String response = new String(is.readAllBytes(), java.nio.charset.StandardCharsets.UTF_8);
            System.out.println("RESPONSE BODY: " + response);
        }
        
        // --- Example of GET anchor request ---
        System.out.println("\n--- Example GET Anchor Request ---");
        String anchorHandle = "3123454333";
        String getUrl = SERVER + "/anchors/" + anchorHandle;
        System.out.println("GET URL: " + getUrl);
        System.out.println("Headers needed:");
        System.out.println("  Content-Type: application/json");
        System.out.println("  x-ledger: " + LEDGER);
        System.out.println("  Authorization: Bearer " + jwt);
        System.out.println("  x-received: " + nowIso);
        System.out.println("  x-dispatched: " + nowIso);
    }
}
