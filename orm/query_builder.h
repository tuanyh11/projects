#pragma once
#include <iostream>
#include <map>
#include <string>

class QueryBuilder {
private:
  // Các biến lưu trữ từng mảnh ghép của câu lệnh SQL
  std::string tableName;
  std::string selectColumns;
  std::string whereCondition;
  std::string limitCount;

public:
  QueryBuilder() {
    selectColumns = "*"; // Mặc định là SELECT *
    whereCondition = "";
    limitCount = "";
  }

  QueryBuilder &table(const std::string &tableName) {
    this->tableName = tableName;
    return *this;
  }

  QueryBuilder &select(const std::string &columns) {
    this->selectColumns = columns;
    return *this;
  }

  QueryBuilder &where(const std::string &condition) {
    if (this->whereCondition.empty()) {
      this->whereCondition = "WHERE " + condition;
    } else {
      this->whereCondition += " AND " + condition;
    }
    return *this;
  }

  QueryBuilder &limit(int number) {
    this->limitCount = "LIMIT " + std::to_string(number);
    return *this;
  }

  std::string toSql() {
    if (tableName.empty()) {
      return "LỖI: Chưa chọn bảng (table)!";
    }

    std::string sql = "SELECT " + selectColumns + " FROM " + tableName;

    if (!whereCondition.empty()) {
      sql += " " + whereCondition;
    }

    if (!limitCount.empty()) {
      sql += " " + limitCount;
    }

    sql += ";";
    return sql;
  }

  std::string insert(const std::map<std::string, std::string> &data) {
    if (tableName.empty()) {
      return "LỖI: Chưa chọn bảng (table) để Insert!";
    }
    if (data.empty()) {
      return "LỖI: Không có dữ liệu để Insert!";
    }

    std::string columns = "";
    std::string values = "";

    for (auto const &[key, val] : data) {
      if (!columns.empty()) {
        columns += ", ";
        values += ", ";
      }
      columns += key;
      values += val;
    }

    std::string sql = "INSERT INTO " + tableName + " (" + columns +
                      ") VALUES (" + values + ");";
    return sql;
  }

  std::string update(const std::map<std::string, std::string> &data) {
    if (tableName.empty()) {
      return "LỖI: Chưa chọn bảng (table) để Update!";
    }
    if (data.empty()) {
      return "LỖI: Không có dữ liệu để Update!";
    }

    std::string setClause = "";

    for (auto const &[key, val] : data) {
      if (!setClause.empty()) {
        setClause += ", ";
      }
      setClause += key + " = " + val;
    }

    std::string sql = "UPDATE " + tableName + " SET " + setClause;

    if (!whereCondition.empty()) {
      sql += " " + whereCondition;
    }

    sql += ";";
    return sql;
  }

  std::string remove() {
    if (tableName.empty()) {
      return "LỖI: Chưa chọn bảng (table) để Delete!";
    }

    std::string sql = "DELETE FROM " + tableName;

    if (!whereCondition.empty()) {
      sql += " " + whereCondition;
    }

    sql += ";";
    return sql;
  }
};