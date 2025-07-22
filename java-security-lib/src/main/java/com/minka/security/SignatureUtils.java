package com.minka.security;

import java.security.PrivateKey;
import java.security.Signature;
import java.util.Base64;

// Utility class for creating Ed25519 digital signatures and encoding them
public class SignatureUtils {
    // Signs a hex digest string with the given Ed25519 private key
    public static byte[] signEd25519(String hexDigest, PrivateKey privateKey) throws Exception {
        byte[] data = hexStringToByteArray(hexDigest); // Convert hex to bytes
        Signature sig = Signature.getInstance("Ed25519", "BC"); // Ed25519 signature engine
        sig.initSign(privateKey); // Initialize with private key
        sig.update(data); // Provide data to sign
        return sig.sign(); // Return signature bytes
    }

    // Encodes a byte array signature to Base64 string
    public static String toBase64(byte[] signature) {
        return Base64.getEncoder().encodeToString(signature);
    }

    // Helper to convert a hex string to a byte array
    private static byte[] hexStringToByteArray(String s) {
        int len = s.length();
        byte[] data = new byte[len / 2];
        for (int i = 0; i < len; i += 2) {
            data[i / 2] = (byte) ((Character.digit(s.charAt(i), 16) << 4)
                                 + Character.digit(s.charAt(i+1), 16));
        }
        return data;
    }
} 