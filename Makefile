# Makefile tiện lợi để quản lý môi trường Docker C++

.PHONY: build up shell down clean run exec cmake-build

# Build Docker image
build:
	docker compose build

# Khởi động container (nền)
up:
	docker compose up -d

# Vào shell của container
shell:
	docker compose exec cpp-dev bash

# Dừng và xóa container
down:
	docker compose down

# Xóa image và container
clean:
	docker compose down --rmi all --volumes

# Compile và chạy file C++ (dùng: make run FILE=hello.cpp)
# Tự động khởi động container nếu chưa chạy
run:
	@if [ -z "$(FILE)" ]; then echo "Dùng: make run FILE=ten_file.cpp"; exit 1; fi
	@docker compose up -d --quiet-pull 2>/dev/null
	docker compose exec cpp-dev bash -c "cd /workspace && g++ -std=c++17 -Wall -Wextra -g $(FILE) -o /tmp/output -lsqlite3 && /tmp/output"

# Chạy lệnh tùy ý trong container (dùng: make exec CMD="g++ --version")
exec:
	@if [ -z "$(CMD)" ]; then echo "Dùng: make exec CMD=\"lenh_ban_muon\""; exit 1; fi
	@docker compose up -d --quiet-pull 2>/dev/null
	docker compose exec cpp-dev bash -c "cd /workspace && $(CMD)"

# Compile toàn bộ với CMake
cmake-build:
	@docker compose up -d --quiet-pull 2>/dev/null
	docker compose exec cpp-dev bash -c "cd /workspace && mkdir -p build && cd build && cmake .. && make"
