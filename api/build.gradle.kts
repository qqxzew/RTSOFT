plugins {
    kotlin("jvm") version "2.2.20"
    application
    kotlin("plugin.serialization") version "2.2.20"
}

group = "io.void"
version = "1.0-SNAPSHOT"

repositories {
    mavenCentral()
    maven { url = uri("https://jitpack.io") }
}

dependencies {
    testImplementation(kotlin("test"))
    implementation("com.github.Jadiefication:Void:v2.0.0")
    implementation("com.auth0:java-jwt:4.4.0")
    implementation(libs.org.jetbrains.kotlin.kotlin.stdlib)
    implementation(libs.org.jetbrains.kotlin.kotlin.reflect)
    implementation(libs.org.jetbrains.kotlinx.kotlinx.coroutines.core)
    implementation(libs.exposed.core)
    implementation(libs.exposed.jdbc)
    implementation(libs.h2)
    implementation("org.jetbrains.kotlinx:kotlinx-serialization-json:1.9.0")
}

tasks.test {
    useJUnitPlatform()
}
kotlin {
    jvmToolchain(21)
}

application {
    // Kotlin file with top-level main has class name MainKt under its package
    mainClass.set("io.rtsoft.MainKt")
}
