package com.minka.security;

import java.security.PrivateKey;
import java.security.Signature;
import java.util.Base64;

public class SignatureUtils {
    public static byte[] signEd25519(String hexDigest, PrivateKey privateKey) throws Exception {
        byte[] data = hexStringToByteArray(hexDigest);
        Signature sig = Signature.getInstance("Ed25519", "BC");
        sig.initSign(privateKey);
        sig.update(data);
        return sig.sign();
    }

    public static String toBase64(byte[] signature) {
        return Base64.getEncoder().encodeToString(signature);
    }

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