package io.rtsoft

import io.voidx.dto.buildRequest
import io.voidx.fetch
import io.voidx.simpleServer

fun main() {
    val server = simpleServer {
        route("/__prompt__") {
            GET { req ->
                return@GET fetch("localhost:5000/__ai__", buildRequest {  }).getOrNull()!!
            }
        }
    }
}