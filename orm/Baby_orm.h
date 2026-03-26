#include "iostream"
#include "map"
#include "query_builder.h"
#include "sqlite3.h"

class BabyOrm {
private:
  std::string dbPath;

public:
  BabyOrm(const std::string &dbPath) : dbPath(dbPath) {}

  void execute(const std::string &sql) {
    sqlite3 *db;
    int rc =
        sqlite3_open_v2(dbPath.c_str(), &db,
                        SQLITE_OPEN_READWRITE | SQLITE_OPEN_CREATE, nullptr);
    if (rc != SQLITE_OK) {
      std::cerr << "Lỗi mở DB: " << sqlite3_errmsg(db) << std::endl;
      return;
    }

    char *errMsg = nullptr;
    rc = sqlite3_exec(db, sql.c_str(), nullptr, nullptr, &errMsg);
    if (rc != SQLITE_OK) {
      std::cerr << "Lỗi SQL: " << errMsg << std::endl;
      sqlite3_free(errMsg);
    }

    sqlite3_close(db);
  }

  void createTable(const std::string &tableName,
                   const std::map<std::string, std::string> &columns) {
    std::string sql = "CREATE TABLE IF NOT EXISTS " + tableName + " (";
    for (auto const &[key, val] : columns) {
      sql += key + " " + val + ", ";
    }
    sql.pop_back();
    sql.pop_back();
    sql += ");";
    execute(sql);
  }

  void insert(const std::string &tableName,
              const std::map<std::string, std::string> &data) {
    QueryBuilder qb;
    execute(qb.table(tableName).insert(data));
  }

  void update(const std::string &tableName,
              const std::map<std::string, std::string> &data) {
    QueryBuilder qb;
    execute(qb.table(tableName).update(data));
  }

  void remove(const std::string &tableName) {
    QueryBuilder qb;
    execute(qb.table(tableName).remove());
  }

  void query(const std::string &sql) {
    sqlite3 *db;
    int rc =
        sqlite3_open_v2(dbPath.c_str(), &db,
                        SQLITE_OPEN_READWRITE | SQLITE_OPEN_CREATE, nullptr);
    if (rc != SQLITE_OK) {
      std::cerr << "Lỗi mở DB: " << sqlite3_errmsg(db) << std::endl;
      return;
    }

    char *errMsg = nullptr;
    rc = sqlite3_exec(
        db, sql.c_str(),
        [](void *, int colCount, char **colValues, char **colNames) -> int {
          for (int i = 0; i < colCount; i++) {
            std::cout << colNames[i] << " = "
                      << (colValues[i] ? colValues[i] : "NULL") << "  ";
          }
          std::cout << std::endl;
          return 0;
        },
        nullptr, &errMsg);

    if (rc != SQLITE_OK) {
      std::cerr << "Lỗi SQL: " << errMsg << std::endl;
      sqlite3_free(errMsg);
    }

    sqlite3_close(db);
  }

  void select(const std::string &tableName) {
    QueryBuilder qb;
    query(qb.table(tableName).toSql());
  }
};
