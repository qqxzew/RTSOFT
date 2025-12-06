package io.rtsoft.db

import org.jetbrains.exposed.v1.core.Table
import org.jetbrains.exposed.v1.jdbc.Database
import org.jetbrains.exposed.v1.jdbc.SchemaUtils
import org.jetbrains.exposed.v1.jdbc.transactions.transaction

object Users : Table("users") {
    val id = integer("id").autoIncrement()
    val googleId = varchar("google_id", 100).uniqueIndex()
    val username = varchar("username", 150).uniqueIndex()

    override val primaryKey = PrimaryKey(id)
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
