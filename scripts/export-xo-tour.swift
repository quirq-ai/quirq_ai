#!/usr/bin/env swift

// macOS-only export of real, sequential PNG captures. No capture or app automation.
// Usage: swift scripts/export-xo-tour.swift FRAMES_DIR OUTPUT.mp4 CAPTIONS.json [--overwrite]
// Caption ranges are inclusive, zero-based frame indexes. The source images are
// preserved at their native scale. An optional pixel crop removes browser/app
// chrome; captions occupy a separate bottom bar without covering product UI.

import AVFoundation
import CoreGraphics
import CoreText
import Foundation
import ImageIO
import UniformTypeIdentifiers
import VideoToolbox

struct Caption: Decodable {
    let start: Int
    let end: Int
    let title: String
    let note: String?
}

struct Configuration: Decodable {
    let fps: Int32
    let captionBarHeight: Int
    let subtitle: String
    let captions: [Caption]
    let crop: PixelCrop?
}

struct PixelCrop: Decodable {
    let x: Int
    let y: Int
    let width: Int
    let height: Int
}

enum ExportError: Error, CustomStringConvertible {
    case invalid(String)

    var description: String {
        switch self {
        case .invalid(let message): return message
        }
    }
}

func require(_ condition: Bool, _ message: String) throws {
    if !condition { throw ExportError.invalid(message) }
}

func loadImage(_ url: URL, crop: PixelCrop?) throws -> CGImage {
    guard let source = CGImageSourceCreateWithURL(url as CFURL, nil),
          let image = CGImageSourceCreateImageAtIndex(source, 0, nil) else {
        throw ExportError.invalid("Cannot decode image: \(url.path)")
    }
    guard let crop else { return image }
    try require(crop.x >= 0 && crop.y >= 0 && crop.width > 0 && crop.height > 0
                && crop.x + crop.width <= image.width && crop.y + crop.height <= image.height,
                "Crop lies outside source frame: \(url.path)")
    guard let cropped = image.cropping(to: CGRect(x: crop.x, y: crop.y, width: crop.width, height: crop.height)) else {
        throw ExportError.invalid("Cannot crop source frame")
    }
    return cropped
}

func drawText(_ text: String, x: CGFloat, y: CGFloat, size: CGFloat,
              color: CGColor, maxWidth: CGFloat, context: CGContext) throws {
    let font = CTFontCreateWithName("HelveticaNeue-Medium" as CFString, size, nil)
    let attributes: [NSAttributedString.Key: Any] = [
        NSAttributedString.Key(kCTFontAttributeName as String): font,
        NSAttributedString.Key(kCTForegroundColorAttributeName as String): color,
    ]
    let line = CTLineCreateWithAttributedString(NSAttributedString(string: text, attributes: attributes))
    try require(CTLineGetTypographicBounds(line, nil, nil, nil) <= Double(maxWidth),
                "Caption is too wide: \(text)")
    context.textMatrix = .identity
    context.textPosition = CGPoint(x: x, y: y)
    CTLineDraw(line, context)
}

func makeFrame(image: CGImage, caption: Caption, configuration: Configuration,
               pool: CVPixelBufferPool, width: Int, height: Int) throws -> CVPixelBuffer {
    var buffer: CVPixelBuffer?
    try require(CVPixelBufferPoolCreatePixelBuffer(nil, pool, &buffer) == kCVReturnSuccess,
                "Cannot allocate pixel buffer")
    guard let buffer else { throw ExportError.invalid("Missing pixel buffer") }
    CVPixelBufferLockBaseAddress(buffer, [])
    defer { CVPixelBufferUnlockBaseAddress(buffer, []) }

    guard let context = CGContext(
        data: CVPixelBufferGetBaseAddress(buffer),
        width: width, height: height, bitsPerComponent: 8,
        bytesPerRow: CVPixelBufferGetBytesPerRow(buffer),
        space: CGColorSpaceCreateDeviceRGB(),
        bitmapInfo: CGImageAlphaInfo.premultipliedFirst.rawValue | CGBitmapInfo.byteOrder32Little.rawValue
    ) else { throw ExportError.invalid("Cannot create rendering context") }

    let barHeight = CGFloat(configuration.captionBarHeight)
    context.setFillColor(CGColor(red: 20 / 255, green: 20 / 255, blue: 22 / 255, alpha: 1))
    context.fill(CGRect(x: 0, y: 0, width: width, height: height))
    context.interpolationQuality = .none
    context.draw(image, in: CGRect(x: 0, y: barHeight, width: CGFloat(width), height: CGFloat(image.height)))
    context.setFillColor(CGColor(red: 48 / 255, green: 48 / 255, blue: 52 / 255, alpha: 1))
    context.fill(CGRect(x: 0, y: barHeight - 1, width: CGFloat(width), height: 1))

    let inset: CGFloat = 30
    try drawText(caption.title, x: inset, y: barHeight - 40, size: 23,
                 color: CGColor(red: 244 / 255, green: 243 / 255, blue: 240 / 255, alpha: 1),
                 maxWidth: CGFloat(width) - inset * 2, context: context)
    try drawText(caption.note ?? configuration.subtitle, x: inset, y: 22, size: 14,
                 color: CGColor(red: 163 / 255, green: 163 / 255, blue: 158 / 255, alpha: 1),
                 maxWidth: CGFloat(width) - inset * 2, context: context)
    return buffer
}

func exportFrames(directory: URL, output: URL, configuration: Configuration,
                  overwrite: Bool) throws -> (Int, Int, Int) {
    try require(configuration.fps > 0 && configuration.fps <= 60, "FPS must be 1–60")
    try require(configuration.captionBarHeight >= 90, "Caption bar must be at least 90px")
    let files = try FileManager.default.contentsOfDirectory(at: directory, includingPropertiesForKeys: nil)
        .filter { $0.lastPathComponent.range(of: #"^\d{5}\.png$"#, options: .regularExpression) != nil }
        .sorted { $0.lastPathComponent < $1.lastPathComponent }
    try require(!files.isEmpty, "No sequential 00000.png captures found")
    for (index, file) in files.enumerated() {
        try require(file.lastPathComponent == String(format: "%05d.png", index),
                    "Capture sequence has a gap at frame \(index)")
        try require(configuration.captions.filter { $0.start <= index && index <= $0.end }.count == 1,
                    "Frame \(index) needs exactly one caption")
    }
    let first = try loadImage(files[0], crop: configuration.crop)
    let width = first.width
    let height = first.height + configuration.captionBarHeight
    try require(width % 2 == 0 && height % 2 == 0, "H.264 output dimensions must be even")
    try FileManager.default.createDirectory(at: output.deletingLastPathComponent(), withIntermediateDirectories: true)
    if FileManager.default.fileExists(atPath: output.path) {
        try require(overwrite, "Output exists; pass --overwrite to replace this export")
        try FileManager.default.removeItem(at: output)
    }

    let writer = try AVAssetWriter(outputURL: output, fileType: .mp4)
    writer.shouldOptimizeForNetworkUse = true
    let input = AVAssetWriterInput(mediaType: .video, outputSettings: [
        AVVideoCodecKey: AVVideoCodecType.h264,
        AVVideoWidthKey: width,
        AVVideoHeightKey: height,
        AVVideoEncoderSpecificationKey: [
            kVTVideoEncoderSpecification_EnableHardwareAcceleratedVideoEncoder as String: false,
        ],
        AVVideoCompressionPropertiesKey: [
            AVVideoAverageBitRateKey: 2_800_000,
            AVVideoExpectedSourceFrameRateKey: configuration.fps,
            AVVideoMaxKeyFrameIntervalKey: configuration.fps * 2,
            AVVideoAllowFrameReorderingKey: false,
            AVVideoProfileLevelKey: AVVideoProfileLevelH264HighAutoLevel,
        ],
    ])
    input.expectsMediaDataInRealTime = false
    let adaptor = AVAssetWriterInputPixelBufferAdaptor(assetWriterInput: input, sourcePixelBufferAttributes: [
        kCVPixelBufferPixelFormatTypeKey as String: kCVPixelFormatType_32BGRA,
        kCVPixelBufferWidthKey as String: width,
        kCVPixelBufferHeightKey as String: height,
        kCVPixelBufferCGImageCompatibilityKey as String: true,
        kCVPixelBufferCGBitmapContextCompatibilityKey as String: true,
    ])
    try require(writer.canAdd(input), "H.264 video settings are unavailable")
    writer.add(input)
    try require(writer.startWriting(), writer.error.map(String.init(describing:)) ?? "Cannot start writer")
    writer.startSession(atSourceTime: .zero)
    guard let pool = adaptor.pixelBufferPool else { throw ExportError.invalid("Missing buffer pool") }

    for (index, file) in files.enumerated() {
        while !input.isReadyForMoreMediaData {
            try require(writer.status == .writing, writer.error.map(String.init(describing:)) ?? "Writer stopped")
            Thread.sleep(forTimeInterval: 0.005)
        }
        try autoreleasepool {
            let image = try loadImage(file, crop: configuration.crop)
            try require(image.width == width && image.height == first.height,
                        "Capture dimensions changed at frame \(index)")
            let caption = configuration.captions.first { $0.start <= index && index <= $0.end }!
            let pixelBuffer = try makeFrame(image: image, caption: caption, configuration: configuration,
                                            pool: pool, width: width, height: height)
            let time = CMTime(value: Int64(index), timescale: configuration.fps)
            try require(adaptor.append(pixelBuffer, withPresentationTime: time),
                        writer.error.map(String.init(describing:)) ?? "Cannot append frame \(index)")
        }
    }
    writer.endSession(atSourceTime: CMTime(value: Int64(files.count), timescale: configuration.fps))
    input.markAsFinished()
    let completion = DispatchSemaphore(value: 0)
    writer.finishWriting { completion.signal() }
    completion.wait()
    try require(writer.status == .completed, writer.error.map(String.init(describing:)) ?? "Export did not complete")
    return (files.count, width, height)
}

func verify(output: URL, expectedFrames: Int, width: Int, height: Int, fps: Int32) async throws {
    let asset = AVURLAsset(url: output)
    guard let track = try await asset.loadTracks(withMediaType: .video).first else {
        throw ExportError.invalid("Export has no video track")
    }
    let playable = try await asset.load(.isPlayable)
    let naturalSize = try await track.load(.naturalSize)
    let duration = CMTimeGetSeconds(try await asset.load(.duration))
    try require(playable, "Export is not playable")
    try require(Int(naturalSize.width) == width && Int(naturalSize.height) == height,
                "Output dimensions do not match")
    try require(abs(duration - Double(expectedFrames) / Double(fps)) < 0.01, "Output duration does not match")
    let reader = try AVAssetReader(asset: asset)
    let trackOutput = AVAssetReaderTrackOutput(track: track, outputSettings: [
        kCVPixelBufferPixelFormatTypeKey as String: kCVPixelFormatType_32BGRA,
    ])
    reader.add(trackOutput)
    try require(reader.startReading(), "Cannot decode exported video")
    var decodedFrames = 0
    while let _ = trackOutput.copyNextSampleBuffer() { decodedFrames += 1 }
    try require(reader.status == .completed && decodedFrames == expectedFrames,
                "Decoded \(decodedFrames) frames; expected \(expectedFrames)")

    // A native decoded poster also provides a quick visual orientation check.
    let generator = AVAssetImageGenerator(asset: asset)
    generator.appliesPreferredTrackTransform = true
    generator.requestedTimeToleranceBefore = .zero
    generator.requestedTimeToleranceAfter = .zero
    let poster = try generator.copyCGImage(at: .zero, actualTime: nil)
    let verificationDirectory = FileManager.default.temporaryDirectory.appendingPathComponent("quirq-tour-verification", isDirectory: true)
    try FileManager.default.createDirectory(at: verificationDirectory, withIntermediateDirectories: true)
    let posterURL = verificationDirectory.appendingPathComponent(output.deletingPathExtension().lastPathComponent).appendingPathExtension("png")
    guard let destination = CGImageDestinationCreateWithURL(posterURL as CFURL, UTType.png.identifier as CFString, 1, nil) else {
        throw ExportError.invalid("Cannot save decoded poster")
    }
    CGImageDestinationAddImage(destination, poster, nil)
    try require(CGImageDestinationFinalize(destination), "Cannot finish poster")
    let bytes = (try FileManager.default.attributesOfItem(atPath: output.path)[.size] as? NSNumber)?.intValue ?? 0
    print("Verified playable H.264 MP4: \(width)×\(height), \(decodedFrames) frames, \(fps) fps, \(duration)s, \(bytes) bytes")
    print(output.path)
    print("Decoded poster: \(posterURL.path)")
}

func writeCaptions(output: URL, configuration: Configuration) throws {
    func timestamp(_ frame: Int) -> String {
        let milliseconds = Int((Double(frame) / Double(configuration.fps) * 1000).rounded())
        return String(format: "%02d:%02d:%02d.%03d", milliseconds / 3_600_000,
                      (milliseconds / 60_000) % 60, (milliseconds / 1000) % 60, milliseconds % 1000)
    }
    func escaped(_ text: String) -> String {
        text.replacingOccurrences(of: "&", with: "&amp;")
            .replacingOccurrences(of: "<", with: "&lt;")
    }
    let cues = configuration.captions.sorted { $0.start < $1.start }.enumerated().map { index, caption in
        "\(index + 1)\n\(timestamp(caption.start)) --> \(timestamp(caption.end + 1))\n"
            + escaped(caption.title) + "\n" + escaped(caption.note ?? configuration.subtitle)
    }
    let vtt = "WEBVTT\n\n" + cues.joined(separator: "\n\n") + "\n"
    let url = output.deletingPathExtension().appendingPathExtension("vtt")
    try vtt.write(to: url, atomically: true, encoding: .utf8)
    print("Caption track: \(url.path)")
}

do {
    let arguments = CommandLine.arguments
    try require(arguments.count >= 4 && arguments.count <= 5,
                "Usage: swift scripts/export-xo-tour.swift FRAMES_DIR OUTPUT.mp4 CAPTIONS.json [--overwrite]")
    if arguments.count == 5 { try require(arguments[4] == "--overwrite", "Unknown option") }
    let directory = URL(fileURLWithPath: arguments[1], isDirectory: true)
    let output = URL(fileURLWithPath: arguments[2])
    let configData = try Data(contentsOf: URL(fileURLWithPath: arguments[3]))
    let configuration = try JSONDecoder().decode(Configuration.self, from: configData)
    let (frames, width, height) = try exportFrames(directory: directory, output: output,
                                                  configuration: configuration, overwrite: arguments.count == 5)
    try await verify(output: output, expectedFrames: frames, width: width, height: height, fps: configuration.fps)
    try writeCaptions(output: output, configuration: configuration)
} catch {
    FileHandle.standardError.write(Data("Export failed: \(error)\n".utf8))
    exit(1)
}
