plugins {
    kotlin("jvm") version "2.2.20"
    application
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
    api(libs.org.jetbrains.kotlin.kotlin.stdlib)
    api(libs.org.jetbrains.kotlin.kotlin.reflect)
    api(libs.org.jetbrains.kotlinx.kotlinx.coroutines.core)
}

tasks.test {
    useJUnitPlatform()
}
kotlin {
    jvmToolchain(24)
}

application {
    // Kotlin file with top-level main has class name MainKt under its package
    mainClass.set("io.rtsoft.MainKt")
}