# Môi Trường C++ với Docker

## Cấu trúc thư mục
```
c++/
├── Dockerfile          # Image Ubuntu 24.04 + công cụ C++
├── docker-compose.yml  # Cấu hình container
├── Makefile            # Lệnh tắt tiện lợi
├── CMakeLists.txt      # Build system CMake
└── hello.cpp           # File test
```

## Công cụ được cài
- **Compiler**: g++, gcc, clang
- **Build**: make, cmake
- **Debug**: gdb, lldb, valgrind
- **Format**: clang-format, clang-tidy
- **Libs**: boost
- **Editors**: vim, nano

## Lệnh thường dùng

### Khởi động môi trường
```bash
make build    # Build Docker image lần đầu
make up       # Khởi động container
make shell    # Vào shell của container
```

### Chạy code
```bash
# Từ bên ngoài container:
make run FILE=hello.cpp

# Từ bên trong container (sau make shell):
g++ -std=c++17 -Wall -g hello.cpp -o hello && ./hello
```

### Dùng CMake
```bash
make cmake-build    # Build toàn bộ project
```

### Dừng môi trường
```bash
make down     # Dừng container
make clean    # Xóa hoàn toàn
```

## Workflow bình thường
1. `make up` — khởi động
2. `make shell` — vào terminal trong container
3. Viết code trong `/Users/tuan/Learn/c++` (tự đồng bộ với `/workspace` trong container)
4. Compile & chạy bên trong container
5. `exit` — ra ngoài
6. `make down` — tắt container
