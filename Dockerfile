# Môi trường C++ phát triển
FROM ubuntu:24.04

# Tránh hỏi trong quá trình cài đặt
ENV DEBIAN_FRONTEND=noninteractive

# Cài các công cụ phát triển C++
RUN apt-get update && apt-get install -y \
    build-essential \
    g++ \
    gcc \
    gdb \
    cmake \
    make \
    valgrind \
    clang \
    clang-format \
    clang-tidy \
    lldb \
    git \
    curl \
    wget \
    vim \
    nano \
    htop \
    tree \
    pkg-config \
    libboost-all-dev \
    && apt-get clean \
    && rm -rf /var/lib/apt/lists/*

# Tạo thư mục làm việc
WORKDIR /workspace

# Mặc định chạy bash
CMD ["/bin/bash"]
