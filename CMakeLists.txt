cmake_minimum_required(VERSION 3.16)
project(MyCppProject VERSION 1.0)

# Dùng C++17
set(CMAKE_CXX_STANDARD 17)
set(CMAKE_CXX_STANDARD_REQUIRED True)

# Bật warning
add_compile_options(-Wall -Wextra -Wpedantic)

# Build debug theo mặc định
if(NOT CMAKE_BUILD_TYPE)
  set(CMAKE_BUILD_TYPE Debug)
endif()

# Thêm executable
add_executable(hello hello.cpp)

# Nếu có nhiều source files, thêm vào đây:
# file(GLOB_RECURSE SOURCES "src/*.cpp")
# add_executable(myapp ${SOURCES})
