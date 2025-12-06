package io.rtsoft.auth

import kotlinx.serialization.Serializable

@Serializable
data class GoogleLoginRequest(
    val idToken: String,
)

@Serializable
data class AuthResponse(
    val token: String,
)
