package io.rtsoft.auth

import com.google.api.client.googleapis.auth.oauth2.GoogleIdTokenVerifier
import com.google.api.client.http.javanet.NetHttpTransport
import com.google.api.client.json.gson.GsonFactory

data class GoogleUser(
    val googleId: String,
    val email: String,
)

fun verifyGoogleIdToken(idTokenString: String, clientId: String): GoogleUser? {
    val verifier =
        GoogleIdTokenVerifier.Builder(NetHttpTransport(), GsonFactory.getDefaultInstance())
            .setAudience(listOf(clientId))
            .build()

    val idToken = verifier.verify(idTokenString) ?: return null
    val payload = idToken.payload

    return GoogleUser(
        googleId = payload.subject,
        email = payload.email,
    )
}
