"use client";
import React, { useState, useRef, useEffect } from "react";
import QRCode from "qrcode";
import styles from "./QRGenerator.module.css";

export default function QRCodeGenerator() {
    const [url, setUrl] = useState("https://hexcyan.xyz");
    const [qrCodeDataURL, setQRCodeDataURL] = useState("");
    const [codeColor, setCodeColor] = useState("#000000");
    const [bgColor, setBgColor] = useState("#ffffff");
    const [qrType, setQrType] = useState("regular");
    const [errorCorrectionLevel, setErrorCorrectionLevel] = useState("M");
    const [transparentBg, setTransparentBg] = useState(false);
    const [logoPreview, setLogoPreview] = useState<string | null>(null);
    const canvasRef = useRef<HTMLCanvasElement>(null);

    const generateQRCode = async () => {
        try {
            const canvas = canvasRef.current;
            if (!canvas) return;

            canvas.width = 300;
            canvas.height = 300;

            const ctx = canvas.getContext("2d", { alpha: true });
            if (ctx) {
                ctx.clearRect(0, 0, canvas.width, canvas.height);
            }

            const options = {
                errorCorrectionLevel: errorCorrectionLevel as
                    | "L"
                    | "M"
                    | "Q"
                    | "H",
                margin: 1,
                width: canvas.width,
                color: {
                    dark: codeColor,
                    light: transparentBg ? "#0000" : bgColor,
                },
            };

            await QRCode.toCanvas(canvas, url, options);

            if (qrType === "framed" && logoPreview) {
                const context = canvas.getContext("2d", { alpha: true });
                if (context) {
                    const size = canvas.width;

                    const centerSize = size * 0.3; // 30% of the QR code size
                    const centerX = (size - centerSize) / 2;
                    const centerY = (size - centerSize) / 2;

                    context.clearRect(centerX, centerY, centerSize, centerSize);

                    if (!transparentBg) {
                        context.fillStyle = bgColor;
                        context.fillRect(
                            centerX,
                            centerY,
                            centerSize,
                            centerSize
                        );
                    }

                    context.strokeStyle = codeColor;
                    context.lineWidth = 3;
                    context.strokeRect(
                        centerX,
                        centerY,
                        centerSize,
                        centerSize
                    );

                    const logoImg = new Image();
                    logoImg.src = logoPreview;
                    logoImg.onload = () => {
                        const logoRatio = logoImg.width / logoImg.height;
                        let logoWidth, logoHeight;

                        // Handle different aspect ratios
                        if (logoRatio > 1) {
                            logoWidth = centerSize * 0.8;
                            logoHeight = logoWidth / logoRatio;
                        } else {
                            logoHeight = centerSize * 0.8;
                            logoWidth = logoHeight * logoRatio;
                        }

                        const logoX = centerX + (centerSize - logoWidth) / 2;
                        const logoY = centerY + (centerSize - logoHeight) / 2;

                        // Insert logo
                        context.drawImage(
                            logoImg,
                            logoX,
                            logoY,
                            logoWidth,
                            logoHeight
                        );

                        setQRCodeDataURL(canvas.toDataURL("image/png"));
                    };
                }
            } else {
                setQRCodeDataURL(canvas.toDataURL("image/png"));
            }
        } catch (error) {
            console.error("Error generating QR code:", error);
            alert("Failed to generate QR code");
        }
    };

    const handleLogoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            const reader = new FileReader();
            reader.onloadend = () => {
                setLogoPreview(reader.result as string);
            };
            reader.readAsDataURL(file);
        }
    };

    const downloadQRCode = () => {
        if (!qrCodeDataURL) return;

        const link = document.createElement("a");
        link.href = qrCodeDataURL;
        link.download = "qrcode.png";
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    useEffect(() => {
        if (url) {
            generateQRCode();
        }
    }, [
        url,
        codeColor,
        bgColor,
        qrType,
        logoPreview,
        errorCorrectionLevel,
        transparentBg,
    ]);

    return (
        <div className={styles.container}>
            <h1 className={styles.title}>QR Code Generator</h1>

            <div className={styles.controls}>
                <div className={styles.inputGroup}>
                    <input
                        id="url-input"
                        type="text"
                        value={url}
                        onChange={(e) => setUrl(e.target.value)}
                        placeholder="Enter Text/URL"
                        className={styles.textInput}
                    />
                </div>

                <div className={styles.mainWrapper}>
                    <div className={styles.optionsGroup}>
                        <div className={styles.colorPickers}>
                            <div className={styles.colorPickerGroup}>
                                <label htmlFor="code-color">QR Code</label>
                                <input
                                    id="code-color"
                                    type="color"
                                    value={codeColor}
                                    onChange={(e) =>
                                        setCodeColor(e.target.value)
                                    }
                                    className={styles.colorPicker}
                                />
                            </div>

                            <div className={styles.colorPickerGroup}>
                                <label htmlFor="bg-color">Background</label>
                                <input
                                    id="bg-color"
                                    type="color"
                                    value={bgColor}
                                    onChange={(e) => setBgColor(e.target.value)}
                                    className={styles.colorPicker}
                                    disabled={transparentBg}
                                />
                            </div>

                            <div className={styles.colorPickerGroup}>
                                <label htmlFor="transparent-bg">
                                    Transparent
                                </label>
                                <div
                                    className={styles.transparentCheckbox}
                                    style={{
                                        backgroundColor: "transparent",
                                        backgroundImage:
                                            "linear-gradient(45deg, #ccc 25%, transparent 25%), linear-gradient(-45deg, #ccc 25%, transparent 25%), linear-gradient(45deg, transparent 75%, #ccc 75%), linear-gradient(-45deg, transparent 75%, #ccc 75%)",
                                        backgroundSize: "20px 20px",
                                        backgroundPosition:
                                            "0 0, 0 10px, 10px -10px, -10px 0px",
                                    }}
                                >
                                    <input
                                        type="checkbox"
                                        id="transparent-bg"
                                        checked={transparentBg}
                                        onChange={(e) =>
                                            setTransparentBg(e.target.checked)
                                        }
                                        className={styles.checkbox}
                                    />
                                </div>
                            </div>
                        </div>

                        <div className={styles.qrTypeSelector}>
                            <label>QR Code Type:</label>
                            <div className={styles.typeButtonGroup}>
                                <button
                                    className={`${styles.typeButton} ${
                                        qrType === "regular"
                                            ? styles.selected
                                            : ""
                                    }`}
                                    onClick={() => setQrType("regular")}
                                    type="button"
                                >
                                    Regular
                                </button>
                                <button
                                    className={`${styles.typeButton} ${
                                        qrType === "framed"
                                            ? styles.selected
                                            : ""
                                    }`}
                                    onClick={() => {
                                        setQrType("framed");
                                        setErrorCorrectionLevel("H");
                                    }}
                                    type="button"
                                >
                                    Framed with Logo
                                </button>
                            </div>
                        </div>
                        {qrType === "framed" || (
                            <div className={styles.errorCorrectionSelector}>
                                <label htmlFor="error-correction">
                                    Error Correction Level:
                                </label>
                                <select
                                    id="error-correction"
                                    value={errorCorrectionLevel}
                                    onChange={(e) =>
                                        setErrorCorrectionLevel(e.target.value)
                                    }
                                    className={styles.selectInput}
                                >
                                    <option value="L">
                                        Low (~7% resistance)
                                    </option>
                                    <option value="M">
                                        Medium (~15% resistance)
                                    </option>
                                    <option value="Q">
                                        Quartile (~25% resistance)
                                    </option>
                                    <option value="H">
                                        High (~30% resistance)
                                    </option>
                                </select>
                                <p className={styles.helpText}>
                                    Higher levels offer better error resistance,
                                    but reduce the QR code&apos;s capacity.
                                </p>
                            </div>
                        )}
                        {qrType === "framed" && (
                            <div className={styles.logoUpload}>
                                <label htmlFor="logo-upload">
                                    Upload Logo/Image for Center:
                                </label>
                                <input
                                    id="logo-upload"
                                    type="file"
                                    accept="image/*"
                                    onChange={handleLogoChange}
                                    className={styles.fileInput}
                                />
                                <p className={styles.helpText}>
                                    Image will be placed in the center of the QR
                                    code.
                                </p>
                            </div>
                        )}
                    </div>
                    <div className={styles.previewArea}>
                        <canvas
                            ref={canvasRef}
                            width={300}
                            height={300}
                            style={{ display: "none" }}
                        />

                        {qrCodeDataURL && (
                            <div className={styles.qrResult}>
                                <div
                                    className={styles.qrImageContainer}
                                    style={{
                                        backgroundColor: transparentBg
                                            ? "transparent"
                                            : bgColor,
                                        backgroundImage: transparentBg
                                            ? "linear-gradient(45deg, #ccc2 25%, transparent 25%), linear-gradient(-45deg, #ccc2 25%, transparent 25%), linear-gradient(45deg, transparent 75%, #ccc2 75%), linear-gradient(-45deg, transparent 75%, #ccc2 75%)"
                                            : "none",
                                        backgroundSize: "20px 20px",
                                        backgroundPosition:
                                            "0 0, 0 10px, 10px -10px, -10px 0px",
                                    }}
                                >
                                    <img
                                        src={qrCodeDataURL}
                                        alt="Generated QR Code"
                                        className={styles.qrImage}
                                    />
                                </div>
                                <button
                                    onClick={downloadQRCode}
                                    className={styles.downloadButton}
                                >
                                    Download QR Code
                                </button>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}
