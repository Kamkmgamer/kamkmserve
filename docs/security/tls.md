# TLS Configuration: Strong Ciphers and Protocols

This app is typically deployed behind a reverse proxy or managed platform (e.g., Nginx, Caddy, Cloudflare, Vercel’s edge/HTTP terminators). Configure TLS at the edge, not in-app.

Recommended (as of 2025-08):

- Protocols: TLSv1.2 and TLSv1.3 only
- Disable: TLSv1.0, TLSv1.1
- Cipher suites (prioritize forward secrecy, AEAD):
  - For TLSv1.3 (negotiated automatically):
    - TLS_AES_256_GCM_SHA384
    - TLS_AES_128_GCM_SHA256
    - TLS_CHACHA20_POLY1305_SHA256
  - For TLSv1.2 (example strong set):
    - ECDHE-ECDSA-AES256-GCM-SHA384
    - ECDHE-RSA-AES256-GCM-SHA384
    - ECDHE-ECDSA-AES128-GCM-SHA256
    - ECDHE-RSA-AES128-GCM-SHA256
    - ECDHE-ECDSA-CHACHA20-POLY1305
    - ECDHE-RSA-CHACHA20-POLY1305
- Disable insecure ciphers: RC4, 3DES, CBC suites (where possible), export ciphers.
- ECDH curves: prefer X25519, secp384r1; disable weak curves.
- OCSP Stapling: enabled
- HSTS: already enabled in `next.config.js`
- Certificate: Use modern RSA-2048+ or ECDSA (P-256) certificates. Prefer ECDSA if client base supports it.

## Nginx example

```nginx
ssl_protocols TLSv1.2 TLSv1.3;
ssl_prefer_server_ciphers off; # TLS 1.3 decides cipher
ssl_ciphers "ECDHE-ECDSA-AES256-GCM-SHA384:ECDHE-RSA-AES256-GCM-SHA384:ECDHE-ECDSA-AES128-GCM-SHA256:ECDHE-RSA-AES128-GCM-SHA256:ECDHE-ECDSA-CHACHA20-POLY1305:ECDHE-RSA-CHACHA20-POLY1305";
ssl_ecdh_curve X25519:secp384r1;
ssl_stapling on;
ssl_stapling_verify on;
add_header Strict-Transport-Security "max-age=31536000; includeSubDomains; preload" always;
```

## Caddy example

```caddy
{
  servers {
    protocols h1 h2 h3
  }
}

example.com {
  encode zstd gzip
  tls {
    curves x25519 p256
    ciphers TLS_AES_256_GCM_SHA384 TLS_AES_128_GCM_SHA256 TLS_CHACHA20_POLY1305_SHA256
  }
  reverse_proxy 127.0.0.1:3000
}
```

## Cloudflare
- Set Minimum TLS to 1.2
- Enable TLS 1.3
- Opportunistic Encryption: on
- HSTS: enabled with preload (ensure apex and subdomains are HTTPS-only)

Revisit periodically and validate with SSL Labs (A+ target) and Mozilla SSL Config Generator.
