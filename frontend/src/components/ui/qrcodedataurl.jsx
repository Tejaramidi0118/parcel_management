/**
 * QR Code Generator Component
 *
 * React wrapper component based on QRCode.js that can convert any text to QR code image
 *
 * Usage example:
 * import QRCodeDataUrl from './components/qrcodedataurl'
 *
 * function App() {
 *   return <QRCodeDataUrl text="https://example.com" /> // Replace with valid URL
 * }
 */
import React, { useEffect, useState } from 'react';
import QRCode from 'qrcode';
/**
 * QR Code Generator Component
 * @param {QRCodeDataUrlProps} props - Component properties
 */
const QRCodeDataUrl = ({ text, width = 128, color = '#000000', backgroundColor = '#ffffff', className = '', }) => {
    const [dataUrl, setDataUrl] = useState('');
    useEffect(() => {
        const generateQR = async () => {
            try {
                const url = await QRCode.toDataURL(text, {
                    width,
                    color: {
                        dark: color,
                        light: backgroundColor,
                    },
                });
                setDataUrl(url);
            }
            catch (err) {
                console.error('Failed to generate QR code:', err);
            }
        };
        generateQR();
    }, [text, width, color, backgroundColor]);
    return (<div className={`qr-code-container ${className}`}>
      {dataUrl ? (<img src={dataUrl} alt={`QR Code: ${text}`} width={width} height={width}/>) : (<div>Generating QR code...</div>)}
    </div>);
};
export default QRCodeDataUrl;
