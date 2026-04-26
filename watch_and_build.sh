#!/bin/bash
set -o pipefail

# Thư mục cần theo dõi
WATCH_DIR="/Users/tuan/Learn/rust/language-app/ios/LinguaApp"
PROJECT_PATH="$WATCH_DIR/LinguaApp.xcodeproj"
SCHEME="LinguaApp"
SIM_ID="B408E045-54A4-429E-9EDA-14CAFB5AB279"
BUNDLE_ID="com.example.LinguaApp"
DERIVED_DATA_PATH="/Users/tuan/Library/Developer/Xcode/DerivedData/LinguaApp-cnzhrpjntxezraexaicvemyehwby"

echo "👀 Đang theo dõi thay đổi trong $WATCH_DIR..."

# Chạy build lần đầu
build_and_run() {
    echo "🚀 Phát hiện thay đổi, đang build lại..."
    xcodebuild -project "$PROJECT_PATH" -scheme "$SCHEME" -destination "platform=iOS Simulator,id=$SIM_ID" build | tail -n 10
    
    if [ $? -eq 0 ]; then
        echo "✅ Build thành công! Đang cài đặt lên Simulator..."
        xcrun simctl install "$SIM_ID" "$DERIVED_DATA_PATH/Build/Products/Debug-iphonesimulator/LinguaApp.app"
        xcrun simctl launch "$SIM_ID" "$BUNDLE_ID"
        echo "🎉 Đã cập nhật app!"
    else
        echo "❌ Build thất bại. Vui lòng kiểm tra lại code."
    fi
}

# Theo dõi các file .swift và chạy build_and_run
fswatch -o -e ".*" -i "\\.swift$" "$WATCH_DIR" | while read f; do
    build_and_run
done
