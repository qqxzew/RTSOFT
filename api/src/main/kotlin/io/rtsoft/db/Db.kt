package io.rtsoft.db

import io.voidx.json.toJson
import org.jetbrains.exposed.v1.core.Table
import org.jetbrains.exposed.v1.core.eq
import org.jetbrains.exposed.v1.jdbc.Database
import org.jetbrains.exposed.v1.jdbc.SchemaUtils
import org.jetbrains.exposed.v1.jdbc.transactions.transaction
import org.jetbrains.exposed.v1.jdbc.update

object Users : Table("users") {
    val id = integer("id").autoIncrement()
    val googleId = varchar("google_id", 100).uniqueIndex()
    val username = varchar("username", 150).uniqueIndex()
    val onboarding = text("onboarding").nullable() // store JSON as text

    override val primaryKey = PrimaryKey(id)
}

fun saveOnboarding(googleId: String, onboarding: List<Map<String, String>>) {
    val json = onboarding.toJson().getOrNull() ?: "[]"
    transaction {
        Users.update({ Users.googleId eq googleId }) {
            it[Users.onboarding] = json
        }
    }
}


fun initDb() {
    Database.connect(
        url = "jdbc:h2:./data/mydb;DB_CLOSE_DELAY=-1",
        driver = "org.h2.Driver",
    )
    transaction {
        SchemaUtils.create(Users)
    }
}
