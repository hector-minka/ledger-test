package com.minka.security;

import com.nimbusds.jose.*;
import com.nimbusds.jose.crypto.Ed25519Signer;
import com.nimbusds.jwt.SignedJWT;
import com.nimbusds.jose.jwk.Curve;
import com.nimbusds.jose.jwk.OctetKeyPair;
import com.nimbusds.jose.jwk.KeyUse;
import com.nimbusds.jose.util.Base64URL;

import java.util.Map;

public class JwtUtils {
    public static String signJWT(Map<String, Object> payload, String base64SecretKey, String base64PublicKey) throws Exception {
        // Convert Base64 keys to JWK OctetKeyPair
        Base64URL d = Base64URL.from(base64SecretKey); // private
        Base64URL x = Base64URL.from(base64PublicKey); // public

        OctetKeyPair jwk = new OctetKeyPair.Builder(Curve.Ed25519, x)
                .d(d)
                .keyUse(KeyUse.SIGNATURE)
                .build();

        JWSHeader header = new JWSHeader.Builder(JWSAlgorithm.EdDSA)
                .keyID(base64PublicKey)
                .type(JOSEObjectType.JWT)
                .build();

        com.nimbusds.jwt.JWTClaimsSet.Builder claimsBuilder = new com.nimbusds.jwt.JWTClaimsSet.Builder();
        for (Map.Entry<String, Object> entry : payload.entrySet()) {
            claimsBuilder.claim(entry.getKey(), entry.getValue());
        }
        com.nimbusds.jwt.JWTClaimsSet claimsSet = claimsBuilder.build();

        SignedJWT signedJWT = new SignedJWT(header, claimsSet);
        JWSSigner signer = new Ed25519Signer(jwk);

        signedJWT.sign(signer);
        return signedJWT.serialize();
    }
} 