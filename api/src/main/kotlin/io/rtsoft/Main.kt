package io.rtsoft

import io.rtsoft.auth.*
import io.rtsoft.db.Users
import io.rtsoft.db.initDb
import io.voidx.dto.buildRequest
import io.voidx.dto.buildResponse
import io.voidx.fetch
import io.voidx.json.parseBody
import io.voidx.json.toJson
import io.voidx.simpleServer
import org.jetbrains.exposed.v1.core.eq
import org.jetbrains.exposed.v1.jdbc.insert
import org.jetbrains.exposed.v1.jdbc.selectAll
import org.jetbrains.exposed.v1.jdbc.transactions.transaction
import java.net.URLEncoder
import java.nio.charset.StandardCharsets

fun main() {
    initDb()

    val googleClientId = System.getenv("GOOGLE_CLIENT_ID") ?: "Placeholder"

    val server =
        simpleServer {
            if (
                fetch(
                    "http://flask:5000/",
                    buildRequest {},
                ).getOrNull()?.status != 200
            ) {
                throw Exception("Flask endpoint not running")
            }

            // ----------- SIGN IN WITH GOOGLE ONLY -----------
            route("/__signin_google__") {
                POST { req ->
                    val body = req.parseBody<GoogleLoginRequest>().getOrNull()!!
                    val googleUser = verifyGoogleIdToken(body.idToken, googleClientId) ?: return@POST buildResponse {
                        headers["Content-Type"] = "application/json"
                        status = 401
                        this.body = """{"error":"invalid google token"}"""
                    }

                    val userId =
                        transaction {
                            val existing =
                                Users.selectAll().where { Users.googleId eq googleUser.googleId }
                                    .singleOrNull()

                            if (existing != null) {
                                existing[Users.id]
                            } else {
                                Users.insert {
                                    it[googleId] = googleUser.googleId
                                    it[email] = googleUser.email
                                }[Users.id]
                            }
                        }

                    val token = createToken(googleUser.email)
                    return@POST buildResponse {
                        headers["Content-Type"] = "application/json"
                        this.body = AuthResponse(token).toJson().getOrNull()!!
                    }
                }
            }

            // ----------- PROTECTED AI ROUTE -----------
            route("/__prompt__") {
                GET { req ->
                    val authHeader = req.headers["Authorization"]
                        ?: return@GET buildResponse {
                            headers["Content-Type"] = "application/json"
                            status = 401
                            body = """{"error":"no token"}"""
                        }

                    val token = authHeader.removePrefix("Bearer ").trim()
                    val email =
                        verifyToken(token)
                            ?: return@GET buildResponse {
                                headers["Content-Type"] = "application/json"
                                status = 403
                                body = """{"error":"invalid token"}"""
                            }

                    val q =
                        queries.entries.joinToString("&") { (key, value) ->
                            "${URLEncoder.encode(key, StandardCharsets.UTF_8)}=" +
                                    "${URLEncoder.encode(value, StandardCharsets.UTF_8)}"
                        }

                    val url = "http://localhost:5000/__ai__?$q"

                    val aiResponse = fetch(url, req).getOrNull()
                    if (aiResponse != null) {
                        return@GET aiResponse
                    }

                    return@GET buildResponse {
                        headers["Content-Type"] = "application/json"
                        status = 500
                        body = """{"error":"AI backend error"}"""
                    }
                }
            }
        }
}
