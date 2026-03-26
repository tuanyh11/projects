#include "map"
#include "orm/Baby_orm.h"

int main() {
  BabyOrm db("test.db");
  db.createTable(
      "users",
      {{"id", "INTEGER PRIMARY KEY"}, {"name", "TEXT"}, {"age", "INTEGER"}});
  db.insert("users", {{"name", "'Tuan'"}, {"age", "20"}});
  db.select("users");
}