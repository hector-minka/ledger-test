package com.minka.security;

import com.minka.security.HashUtils;
import com.minka.security.KeyUtils;
import com.minka.security.SignatureUtils;
import com.minka.security.JwtUtils;
import java.util.*;
import java.time.Instant;
import java.security.PrivateKey;

public class IntentApiSecurityTest {
    public static void main(String[] args) throws Exception {
        // --- Signer and keys (from intents-api.ts) ---
        final String SIGNER = "htorohn";
        final String PUBLIC_KEY = "YiY9jEkH3wldB7YWGvc/Ht2VgsYY7JU2OSSaE7DvtYw=";
        final String SECRET_KEY = "fiCwMZ406y4uzpCvB+bZZAemToHooagwLGn15We+m0s=";
        final String LEDGER = "hector-ledger-test";

        // --- Access rules (getOwnerAccessRules) ---
        List<Map<String, Object>> access = new ArrayList<>();
        Map<String, Object> anyRule = new HashMap<>();
        anyRule.put("action", "any");
        Map<String, Object> signerMap = new HashMap<>();
        signerMap.put("public", PUBLIC_KEY);
        anyRule.put("signer", signerMap);
        access.add(anyRule);
        Map<String, Object> readRule = new HashMap<>();
        readRule.put("action", "read");
        Map<String, Object> bearerMap = new HashMap<>();
        Map<String, Object> $signerMap = new HashMap<>();
        $signerMap.put("public", PUBLIC_KEY);
        bearerMap.put("$signer", $signerMap);
        readRule.put("bearer", bearerMap);
        access.add(readRule);

        // --- Claim ---
        Map<String, Object> claim = new HashMap<>();
        claim.put("action", "transfer");
        Map<String, Object> source = new HashMap<>();
        source.put("handle", "svgs:1234567@bac.com.hn");
        Map<String, Object> sourceCustom = new HashMap<>();
        sourceCustom.put("entityType", "individual");
        sourceCustom.put("idNumber", "1234567");
        sourceCustom.put("idType", "txid");
        sourceCustom.put("name", "Hector Toro");
        sourceCustom.put("phoneNumber", "98761065");
        source.put("custom", sourceCustom);
        claim.put("source", source);
        Map<String, Object> target = new HashMap<>();
        target.put("handle", "svgs:1234567@ficohsa.com.hn");
        Map<String, Object> targetCustom = new HashMap<>();
        targetCustom.put("entityType", "individual");
        targetCustom.put("idNumber", "7654321");
        targetCustom.put("idType", "txid");
        targetCustom.put("name", "Alfredo del Cid");
        target.put("custom", targetCustom);
        claim.put("target", target);
        Map<String, Object> symbol = new HashMap<>();
        symbol.put("handle", "cop");
        claim.put("symbol", symbol);
        claim.put("amount", 400);

        // --- Data ---
        java.text.SimpleDateFormat sdf = new java.text.SimpleDateFormat("yyyyMMddHHmmssSSS");
        String timestamp = sdf.format(new java.util.Date());
        String handle = timestamp + "ALI" + (int)(Math.random() * 1_000_000_000L);
        Map<String, Object> data = new HashMap<>();
        data.put("handle", handle);
        data.put("claims", new Object[]{claim});
        data.put("schema", "transfer");
        data.put("access", access);
        Map<String, Object> config = new HashMap<>();
        config.put("commit", "auto");
        data.put("config", config);

        // --- signatureCustom (use ISO8601 timestamps) ---
        String nowIso = Instant.now().toString();
        Map<String, Object> signatureCustom = new HashMap<>();
        signatureCustom.put("moment", nowIso);
        signatureCustom.put("status", "created");
        signatureCustom.put("consented", nowIso);
        signatureCustom.put("received", nowIso);
        signatureCustom.put("dispatched", nowIso);

        // --- Key loading ---
        String derKeyPath = "htorohn-key.der";
        PrivateKey privateKey = KeyUtils.loadEd25519PrivateKeyFromDerFile(derKeyPath);
        String base64PublicKey = PUBLIC_KEY;

        // --- Hashing ---
        String hash = HashUtils.createHash(data);
        System.out.println("HASH: " + hash);

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
        meta.put("proofs", new Object[]{proof});
        Map<String, Object> request = new HashMap<>();
        request.put("data", data);
        request.put("hash", hash);
        request.put("meta", meta);

        System.out.println("REQUEST: " + HashUtils.serializeData(request));
        System.out.println("JWT (for Authorization header): Bearer " + jwt);

        // --- HTTP POST to server ---
        String serverUrl = "https://ldg-stg.one/api/v2/intents";
        String ledger = "hector-ledger-test";
        String jsonRequest = HashUtils.serializeData(request);
        java.net.URL url = new java.net.URL(serverUrl);
        java.net.HttpURLConnection conn = (java.net.HttpURLConnection) url.openConnection();
        conn.setRequestMethod("POST");
        conn.setRequestProperty("Content-Type", "application/json");
        conn.setRequestProperty("x-ledger", ledger);
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
    }
} 