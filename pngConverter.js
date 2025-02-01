// 用來處理圖片，導出最相近的rgb顏色數值
const fs = require('fs');
const path = require('path');
const { createCanvas, loadImage } = require('canvas');

const inputDir = './images'; // 設定你的圖片資料夾
const outputFile = './output.json';

// 計算圖片的主要顏色
async function getDominantColor(imagePath) {
    const img = await loadImage(imagePath);
    const canvas = createCanvas(img.width, img.height);
    const ctx = canvas.getContext('2d');
    ctx.drawImage(img, 0, 0);

    const imageData = ctx.getImageData(0, 0, img.width, img.height).data;
    const colorCount = {};

    for (let i = 0; i < imageData.length; i += 4) {
        const r = imageData[i];
        const g = imageData[i + 1];
        const b = imageData[i + 2];
        const key = `${r},${g},${b}`;
        colorCount[key] = (colorCount[key] || 0) + 1;
    }

    // 找出出現最多次的顏色
    let dominantColor = Object.entries(colorCount).reduce((a, b) => (b[1] > a[1] ? b : a))[0];
    return dominantColor.split(',').map(Number);
}

async function processImages() {
    const files = fs.readdirSync(inputDir).filter(file => file.endsWith('.png'));
    const result = {};

    for (const file of files) {
        const filePath = path.join(inputDir, file);
        const dominantColor = await getDominantColor(filePath);
        const blockName = path.basename(file, '.png');
        result[`minecraft:${blockName}`] = dominantColor;
    }

    fs.writeFileSync(outputFile, JSON.stringify(result, null, 4));
    console.log('JSON 檔案已生成:', outputFile);
}

processImages().catch(console.error);