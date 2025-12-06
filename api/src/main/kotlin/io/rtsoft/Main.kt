package io.rtsoft

import io.rtsoft.auth.*
import io.rtsoft.db.Users
import io.rtsoft.db.initDb
import io.voidx.Method
import io.voidx.dto.buildRequest
import io.voidx.dto.buildResponse
import io.voidx.dto.emptyResponse
import io.voidx.fetch
import io.voidx.json.parseBody
import io.voidx.json.toJson
import io.voidx.middleware.relayAfter
import io.voidx.page.notFoundPage
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
            +relayAfter { res ->
                val response = res.getOrNull()
                response?.headers["Access-Control-Allow-Origin"] = "http://localhost:3000"
                response?.headers["Access-Control-Allow-Methods"] = "GET, POST, OPTIONS"
                response?.headers["Access-Control-Allow-Headers"] = "Content-Type, Authorization"
            }

            if (
                fetch(
                    "http://flask:5000/",
                    buildRequest {},
                ).getOrNull()?.status != 200
            ) {
                throw Exception("Flask endpoint not running")
            }

            // ----------- SIGN UP WITH GOOGLE -----------
            route("/__signup_google__") {
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
                                // User already exists
                                return@transaction null
                            } else {
                                Users.insert {
                                    it[googleId] = googleUser.googleId
                                    it[username] = googleUser.username
                                }[Users.id]
                            }
                        }

                    if (userId == null) {
                        return@POST buildResponse {
                            headers["Content-Type"] = "application/json"
                            status = 409
                            this.body = """{"error":"user already exists"}"""
                        }
                    }

                    val token = createToken(googleUser.username) // or keep email for token claims if needed
                    return@POST buildResponse {
                        headers["Content-Type"] = "application/json"
                        this.body = AuthResponse(token, googleUser.username).toJson().getOrNull()!!
                    }
                }
                OPTIONS { req ->
                    buildResponse {
                        headers["Access-Control-Allow-Origin"] = "http://localhost:3000"
                        headers["Access-Control-Allow-Methods"] = "GET, POST, OPTIONS"
                        headers["Access-Control-Allow-Headers"] = "Content-Type, Authorization"
                        status = 200
                        body = ""
                    }
                }
            }

            // ----------- SIGN IN WITH GOOGLE -----------
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
                                    it[username] = googleUser.username
                                }[Users.id]
                            }
                        }

                    val token = createToken(googleUser.username) // or keep email for token claims if needed
                    return@POST buildResponse {
                        headers["Content-Type"] = "application/json"
                        this.body = AuthResponse(token, googleUser.username).toJson().getOrNull()!!
                    }
                }
                OPTIONS { req ->
                    buildResponse {
                        headers["Access-Control-Allow-Origin"] = "http://localhost:3000"
                        headers["Access-Control-Allow-Methods"] = "GET, POST, OPTIONS"
                        headers["Access-Control-Allow-Headers"] = "Content-Type, Authorization"
                        status = 200
                        body = ""
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

                    // Use flask container hostname
                    val flaskUrl = System.getenv("FLASK_URL") ?: "http://flask:5000"
                    val url = "$flaskUrl/__ai__?$q"

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
                OPTIONS { req ->
                    buildResponse {
                        headers["Access-Control-Allow-Origin"] = "http://localhost:3000"
                        headers["Access-Control-Allow-Methods"] = "GET, POST, OPTIONS"
                        headers["Access-Control-Allow-Headers"] = "Content-Type, Authorization"
                        status = 200
                        body = ""
                    }
                }
            }

            route(notFoundPage {
                return@notFoundPage if (request.method == Method.OPTIONS) {
                    buildResponse {
                        headers["Access-Control-Allow-Origin"] = "http://localhost:3000"
                        headers["Access-Control-Allow-Methods"] = "GET, POST, OPTIONS"
                        headers["Access-Control-Allow-Headers"] = "Content-Type, Authorization"
                        status = 200
                        body = ""
                    }
                } else emptyResponse()
            })
        }
}
