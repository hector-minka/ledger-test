package com.minka.security;

import java.security.PrivateKey;
import java.security.PublicKey;
import java.security.Security;
import java.util.Base64;
import org.bouncycastle.jce.provider.BouncyCastleProvider;
import java.nio.file.Files;
import java.nio.file.Paths;
import java.security.spec.PKCS8EncodedKeySpec;
import java.security.KeyFactory;

// Utility class for loading Ed25519 keys
public class KeyUtils {
    static {
        // Register BouncyCastle as a security provider (needed for Ed25519)
        Security.addProvider(new BouncyCastleProvider());
    }

    // Loads an Ed25519 private key from a Base64-encoded PKCS#8 DER string
    public static PrivateKey loadEd25519PrivateKeyFromBase64(String base64Key) throws Exception {
        byte[] keyBytes = Base64.getDecoder().decode(base64Key); // Decode Base64
        PKCS8EncodedKeySpec spec = new PKCS8EncodedKeySpec(keyBytes); // PKCS#8 spec
        KeyFactory kf = KeyFactory.getInstance("Ed25519", "BC"); // Use BouncyCastle
        return kf.generatePrivate(spec); // Return PrivateKey object
    }

    // Loads an Ed25519 private key from a PKCS#8 DER file (recommended)
    public static PrivateKey loadEd25519PrivateKeyFromDerFile(String filePath) throws Exception {
        byte[] keyBytes = Files.readAllBytes(Paths.get(filePath)); // Read file bytes
        PKCS8EncodedKeySpec spec = new PKCS8EncodedKeySpec(keyBytes); // PKCS#8 spec
        KeyFactory kf = KeyFactory.getInstance("Ed25519", "BC"); // Use BouncyCastle
        return kf.generatePrivate(spec); // Return PrivateKey object
    }

    // Loads an Ed25519 public key from a Base64-encoded X.509 DER string
    public static PublicKey loadEd25519PublicKeyFromBase64(String base64Key) throws Exception {
        byte[] keyBytes = Base64.getDecoder().decode(base64Key); // Decode Base64
        return KeyFactory.getInstance("Ed25519", "BC").generatePublic(new java.security.spec.X509EncodedKeySpec(keyBytes));
    }
} 