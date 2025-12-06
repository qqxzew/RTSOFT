package io.rtsoft.auth

import com.auth0.jwt.JWT
import com.auth0.jwt.algorithms.Algorithm
import java.util.Date

val jwtSecret = System.getenv("JWT_SECRET") ?: "FALLBACK"

fun createToken(email: String): String =
    JWT.create()
        .withClaim("email", email)
        .withIssuer("my-auth-app")
        .withExpiresAt(Date(System.currentTimeMillis() + 3600_000))
        .sign(Algorithm.HMAC256(jwtSecret))

fun verifyToken(token: String): String? =
    try {
        val decoded =
            JWT.require(Algorithm.HMAC256(jwtSecret))
                .withIssuer("my-auth-app")
                .build()
                .verify(token)
        decoded.getClaim("email").asString()
    } catch (_: Exception) {
        null
    }
