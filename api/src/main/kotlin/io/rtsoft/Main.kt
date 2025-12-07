package io.rtsoft

import com.openai.client.OpenAIClient
import com.openai.client.okhttp.OpenAIOkHttpClient
import com.openai.models.ChatModel
import com.openai.models.chat.completions.ChatCompletionCreateParams
import io.rtsoft.auth.*
import io.rtsoft.db.Users
import io.rtsoft.db.initDb
import io.rtsoft.db.saveOnboarding
import io.voidx.Method
import io.voidx.dto.buildRequest
import io.voidx.dto.buildResponse
import io.voidx.dto.emptyResponse
import io.voidx.dto.forbidden
import io.voidx.dto.unauthorized
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
    val flaskUrl = System.getenv("FLASK_URL") ?: "http://flask:5000"

    waitForFlask(flaskUrl)

    // Initialize OpenAI client once
    val openAiClient: OpenAIClient = OpenAIOkHttpClient.fromEnv()

    val server = simpleServer {
        +relayAfter { res ->
            val response = res.getOrNull()
            response?.headers["Access-Control-Allow-Origin"] = "http://localhost:3000"
            response?.headers["Access-Control-Allow-Methods"] = "GET, POST, OPTIONS"
            response?.headers?.set("Access-Control-Allow-Headers", "Content-Type, Authorization")
        }

        // ----------- SIGN UP WITH GOOGLE -----------
        route("/__signup_google__") {
            POST { req ->
                val body = req.parseBody<GoogleLoginRequest>().getOrNull()!!
                val googleUser = verifyGoogleIdToken(body.idToken, googleClientId)
                    ?: return@POST buildResponse {
                        headers["Content-Type"] = "application/json"
                        status = 401
                        this.body = """{"error":"invalid google token"}"""
                    }

                val userId = transaction {
                    val existing = Users.selectAll().where { Users.googleId eq googleUser.googleId }
                        .singleOrNull()
                    if (existing != null) {
                        null
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

                val token = createToken(googleUser.username)
                return@POST buildResponse {
                    headers["Content-Type"] = "application/json"
                    this.body = AuthResponse(token, googleUser.username).toJson().getOrNull()!!
                }
            }
            OPTIONS { _ ->
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
                val googleUser = verifyGoogleIdToken(body.idToken, googleClientId)
                    ?: return@POST buildResponse {
                        headers["Content-Type"] = "application/json"
                        status = 401
                        this.body = """{"error":"invalid google token"}"""
                    }

                val userId = transaction {
                    val existing = Users.selectAll().where { Users.googleId eq googleUser.googleId }
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

                val token = createToken(googleUser.username)
                return@POST buildResponse {
                    headers["Content-Type"] = "application/json"
                    this.body = AuthResponse(token, googleUser.username).toJson().getOrNull()!!
                }
            }
            OPTIONS { _ ->
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
                val body = req.parseBody<Map<String, Any>>().getOrNull() ?: emptyMap()
                val prompt = body["prompt"] as? String ?: ""
                val session = body["session"] as? String ?: "default"
                val onboarding = body["onboarding"] ?: emptyList<Any>()

                val flaskBody = mapOf(
                    "prompt" to prompt,
                    "session" to session,
                    "onboarding" to onboarding
                )

                val url = "$flaskUrl/__ai__"
                return@GET fetch(url, buildRequest {
                    method = Method.POST
                    this.body = flaskBody.toJson().getOrNull()!!
                    headers["Content-Type"] = "application/json"
                }).getOrNull() ?: buildResponse {
                    status = 500
                    this.body = """{"error":"AI backend error"}"""
                }
            }
            OPTIONS { _ ->
                buildResponse {
                    headers["Access-Control-Allow-Origin"] = "http://localhost:3000"
                    headers["Access-Control-Allow-Methods"] = "GET, POST, OPTIONS"
                    headers["Access-Control-Allow-Headers"] = "Content-Type, Authorization"
                    status = 200
                    body = ""
                }
            }
        }

        // ----------- GENERATE ROADMAP -----------
        route("/__generate_roadmap__") {
            POST { req ->
                val body = req.parseBody<Map<String, String>>().getOrNull() ?: emptyMap()
                val profession = body["profession"] ?: "Frontend Developer"
                val onboardingJson = req.headers["X-Onboarding-Data"] ?: "[]"

                val prompt = """
                    Use the following structured user onboarding information to personalize the roadmap:

$onboardingJson
                    Generate a roadmap for the profession "$profession". 
Each roadmap step should include:
- id
- title
- description
- category (foundation/intermediate/advanced/expert)
- estimated_duration
- resources: for each resource, provide an object with
  - name: the resource name
  - url: the link to the resource
Return the output as valid JSON array of steps. Do it in czech.
                """.trimIndent()

                val params = ChatCompletionCreateParams.builder()
                    .addUserMessage(prompt)
                    .model(ChatModel.GPT_4O_MINI)  // or whichever model you prefer
                    .build()

                val chatCompletion = openAiClient.chat().completions().create(params)
                val content = chatCompletion.choices().first().message().content().orElse("")
                    .replace(Regex("^```json\\s*"), "")
                    .replace(Regex("```$"), "")


                return@POST buildResponse {
                    headers["Content-Type"] = "application/json"
                    this.body = content
                }
            }
            OPTIONS { _ ->
                buildResponse {
                    headers["Access-Control-Allow-Origin"] = "http://localhost:3000"
                    headers["Access-Control-Allow-Methods"] = "GET, POST, OPTIONS"
                    headers["Access-Control-Allow-Headers"] = "Content-Type, Authorization"
                    status = 200
                    body = ""
                }
            }
        }

        // fallback / 404
        route(notFoundPage {
            if (request.method == Method.OPTIONS) {
                buildResponse {
                    headers["Access-Control-Allow-Origin"] = "http://localhost:3000"
                    headers["Access-Control-Allow-Methods"] = "GET, POST, OPTIONS"
                    headers["Access-Control-Allow-Headers"] = "Content-Type, Authorization"
                    status = 200
                    body = ""
                }
            } else {
                emptyResponse()
            }
        })

        route("/__save_onboarding__") {
            POST { req ->
                val body = req.parseBody<Map<String, Any>>().getOrNull() ?: emptyMap()
                val token = req.headers["Authorization"]?.removePrefix("Bearer ") ?: return@POST unauthorized("")
                val googleId = verifyToken(token) ?: return@POST forbidden("")

                val onboarding = body["onboarding"] ?: emptyList<Any>()
                saveOnboarding(googleId, onboarding as List<Map<String, String>>)

                buildResponse {
                    status = 200
                    this.body = """{"status":"ok"}"""
                }
            }
        }

    }
}

fun waitForFlask(url: String, attempts: Int = 10, delayMs: Long = 1000) {
    repeat(attempts) { i ->
        val status = runCatching {
            fetch(url, buildRequest {}).getOrNull()?.status
        }.getOrNull()
        if (status == 200) return
        println("[kotlin] Waiting for Flask... attempt ${i + 1}")
        Thread.sleep(delayMs)
    }
    throw Exception("Flask endpoint not running after $attempts attempts")
}
