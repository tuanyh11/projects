// swift-tools-version: 5.9
import PackageDescription

let package = Package(
    name: "LinguaApp",
    platforms: [
        .iOS(.v17)
    ],
    products: [
        .library(name: "LinguaApp", targets: ["LinguaApp"])
    ],
    targets: [
        .target(
            name: "LinguaApp",
            path: "LinguaApp"
        )
    ]
)
