package io.rtsoft

import io.voidx.dto.buildRequest
import io.voidx.dto.notImplemented
import io.voidx.fetch
import io.voidx.simpleServer
import java.net.URLEncoder
import java.nio.charset.StandardCharsets

fun main() {
    val server = simpleServer {
        route("/__prompt__") {
            GET { req ->
                // Ensure scheme in upstream URL
                return@GET fetch("http://localhost:5000/__ai__?${this.queries.entries.joinToString("&") { (key, value) ->
                    "${URLEncoder.encode(key, StandardCharsets.UTF_8)}=${URLEncoder.encode(value, StandardCharsets.UTF_8)}"
                }}", req).getOrNull() ?: notImplemented("No API key set")
            }
        }
    }
}