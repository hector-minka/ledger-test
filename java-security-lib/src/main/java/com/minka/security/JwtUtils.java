package com.minka.security;

import com.nimbusds.jose.*;
import com.nimbusds.jose.crypto.Ed25519Signer;
import com.nimbusds.jwt.SignedJWT;
import com.nimbusds.jose.jwk.Curve;
import com.nimbusds.jose.jwk.OctetKeyPair;
import com.nimbusds.jose.jwk.KeyUse;
import com.nimbusds.jose.util.Base64URL;

import java.util.Map;

// Utility class for signing JWT tokens with Ed25519 keys
public class JwtUtils {
    // Signs a JWT payload with Ed25519 using the secret and public key (Base64 strings)
    public static String signJWT(Map<String, Object> payload, String base64SecretKey, String base64PublicKey) throws Exception {
        // Convert Base64 keys to JWK OctetKeyPair (Nimbus format)
        Base64URL d = Base64URL.from(base64SecretKey); // Private key
        Base64URL x = Base64URL.from(base64PublicKey); // Public key

        // Build the JWK (JSON Web Key) for Ed25519
        OctetKeyPair jwk = new OctetKeyPair.Builder(Curve.Ed25519, x)
                .d(d)
                .keyUse(KeyUse.SIGNATURE)
                .build();

        // Build JWT header (EdDSA algorithm, key ID is public key)
        JWSHeader header = new JWSHeader.Builder(JWSAlgorithm.EdDSA)
                .keyID(base64PublicKey)
                .type(JOSEObjectType.JWT)
                .build();

        // Build JWT claims from the payload map
        com.nimbusds.jwt.JWTClaimsSet.Builder claimsBuilder = new com.nimbusds.jwt.JWTClaimsSet.Builder();
        for (Map.Entry<String, Object> entry : payload.entrySet()) {
            claimsBuilder.claim(entry.getKey(), entry.getValue());
        }
        com.nimbusds.jwt.JWTClaimsSet claimsSet = claimsBuilder.build();

        // Create and sign the JWT
        SignedJWT signedJWT = new SignedJWT(header, claimsSet);
        JWSSigner signer = new Ed25519Signer(jwk);
        signedJWT.sign(signer);
        return signedJWT.serialize(); // Return the JWT as a string
    }
} 