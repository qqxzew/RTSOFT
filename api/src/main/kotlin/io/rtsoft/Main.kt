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

    val server =
        simpleServer {
            if (fetch(
                    "http://localhost:5000/",
                    buildRequest {
                    },
                ).getOrNull()?.status != 200
            ) {
                throw Exception("Flask endpoint not running")
            }
            route("/__signup__") {
                POST { req ->
                    val authReq = req.parseBody<AuthRequest>().getOrNull()!!

                    val exists =
                        transaction {
                            !Users.selectAll().where { Users.username eq authReq.username }.empty()
                        }
                    if (exists) {
                        return@POST buildResponse {
                            headers["Content-Type"] = "application/json"
                            status = 409
                            body = """{"error":"username taken"}"""
                        }
                    }
                    val pwHash = hashPassword(authReq.password)
                    transaction {
                        Users.insert {
                            it[username] = authReq.username
                            it[passwordHash] = pwHash
                        }
                    }
                    return@POST buildResponse {
                        headers["Content-Type"] = "application/json"
                        body = """{"status":"ok"}"""
                    }
                }
            }

            route("/__signin__") {
                POST { req ->
                    val authReq = req.parseBody<AuthRequest>().getOrNull()!!

                    val user =
                        transaction {
                            Users.selectAll().where { Users.username eq authReq.username }.singleOrNull()
                        }
                    if (user == null || !verifyPassword(authReq.password, user[Users.passwordHash])) {
                        return@POST buildResponse {
                            headers["Content-Type"] = "application/json"
                            status = 401
                            body = """{"error":"invalid credentials"}"""
                        }
                    }
                    val token = createToken(authReq.username)
                    val resp = AuthResponse(token)
                    val body = resp.toJson().getOrNull()!!
                    return@POST buildResponse<String> {
                        headers["Content-Type"] = "application/json"
                        this.body = body
                    }
                }
            }

            route("/__prompt__") {
                GET { req ->
                    val authHeader =
                        req.headers["Authorization"] ?: return@GET buildResponse {
                            headers["Content-Type"] = "application/json"
                            status = 401
                            body = """{"error":"no token"}"""
                        }
                    val token = authHeader.removePrefix("Bearer ").trim()
                    val username =
                        verifyToken(token) ?: return@GET buildResponse {
                            headers["Content-Type"] = "application/json"
                            status = 403
                            body = """{"error":"invalid token"}"""
                        }

                    // build AI-backend URL using query parameters
                    val q =
                        queries.entries.joinToString("&") { (key, value) ->
                            "${URLEncoder.encode(key, StandardCharsets.UTF_8)}=${URLEncoder.encode(value, StandardCharsets.UTF_8)}"
                        }
                    val url = "http://localhost:5000/__ai__?$q"

                    val aiResponse = fetch(url, req).getOrNull()
                    return@GET when {
                        aiResponse != null -> {
                            aiResponse
                        }

                        else -> {
                            buildResponse {
                                headers["Content-Type"] = "application/json"
                                status = 500
                                body = """{"error":"AI backend error"}"""
                            }
                        }
                    }
                }
            }
        }
}
