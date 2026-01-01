import sharp from 'sharp';

/**
 * Add a watermark to an image with username and Network32 branding
 * @param imageBuffer - The original image buffer
 * @param userName - The user's display name
 * @returns Watermarked image buffer
 */
export async function addWatermark(imageBuffer: Buffer, userName: string): Promise<Buffer> {
    // Get image metadata to determine dimensions
    const metadata = await sharp(imageBuffer).metadata();
    const width = metadata.width || 1200;
    const height = metadata.height || 800;

    // Calculate font size based on image dimensions (responsive)
    const fontSize = Math.max(16, Math.min(32, Math.floor(width / 40)));
    const padding = Math.floor(fontSize * 1.5);

    // Create watermark text
    const watermarkText = `${userName} | Network32`;

    // Create SVG for the watermark with shadow effect for visibility
    const svgWatermark = `
        <svg width="${width}" height="${height}">
            <defs>
                <filter id="shadow" x="-20%" y="-20%" width="140%" height="140%">
                    <feDropShadow dx="1" dy="1" stdDeviation="2" flood-color="black" flood-opacity="0.7"/>
                </filter>
            </defs>
            <text
                x="${width - padding}"
                y="${height - padding}"
                text-anchor="end"
                font-family="Arial, sans-serif"
                font-size="${fontSize}"
                font-weight="bold"
                fill="rgba(255, 255, 255, 0.85)"
                filter="url(#shadow)"
            >${watermarkText}</text>
        </svg>
    `;

    // Composite the watermark onto the image
    const watermarkedImage = await sharp(imageBuffer)
        .composite([
            {
                input: Buffer.from(svgWatermark),
                top: 0,
                left: 0,
            },
        ])
        .jpeg({ quality: 90 })
        .toBuffer();

    return watermarkedImage;
}
