package io.rtsoft.auth

import com.auth0.jwt.JWT
import com.auth0.jwt.algorithms.Algorithm
import java.security.MessageDigest
import java.util.Date

fun hashPassword(password: String): String {
    val md = MessageDigest.getInstance("SHA-256")
    return md.digest(password.toByteArray()).joinToString("") { "%02x".format(it) }
}

fun verifyPassword(
    password: String,
    hash: String,
): Boolean = hashPassword(password) == hash

val jwtSecret = System.getenv("JWT_SECRET") ?: "PLEASE_CHANGE_ME"

fun createToken(username: String): String =
    JWT
        .create()
        .withClaim("username", username)
        .withIssuer("my-auth-app")
        .withExpiresAt(Date(System.currentTimeMillis() + 3600_000)) // 1h
        .sign(Algorithm.HMAC256(jwtSecret))

fun verifyToken(token: String): String? =
    try {
        val decoded =
            JWT
                .require(Algorithm.HMAC256(jwtSecret))
                .withIssuer("my-auth-app")
                .build()
                .verify(token)
        decoded.getClaim("username").asString()
    } catch (e: Exception) {
        null
    }
