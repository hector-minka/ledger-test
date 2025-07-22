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

public class KeyUtils {
    static {
        Security.addProvider(new BouncyCastleProvider());
    }

    public static PrivateKey loadEd25519PrivateKeyFromBase64(String base64Key) throws Exception {
        byte[] keyBytes = Base64.getDecoder().decode(base64Key);
        PKCS8EncodedKeySpec spec = new PKCS8EncodedKeySpec(keyBytes);
        KeyFactory kf = KeyFactory.getInstance("Ed25519", "BC");
        return kf.generatePrivate(spec);
    }

    public static PrivateKey loadEd25519PrivateKeyFromDerFile(String filePath) throws Exception {
        byte[] keyBytes = Files.readAllBytes(Paths.get(filePath));
        PKCS8EncodedKeySpec spec = new PKCS8EncodedKeySpec(keyBytes);
        KeyFactory kf = KeyFactory.getInstance("Ed25519", "BC");
        return kf.generatePrivate(spec);
    }

    public static PublicKey loadEd25519PublicKeyFromBase64(String base64Key) throws Exception {
        byte[] keyBytes = Base64.getDecoder().decode(base64Key);
        return KeyFactory.getInstance("Ed25519", "BC").generatePublic(new java.security.spec.X509EncodedKeySpec(keyBytes));
    }
} 