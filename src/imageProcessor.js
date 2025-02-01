const { createCanvas, loadImage } = require('canvas');
const fs = require('fs');
const path = require('path');
const blockMap = require('./blockMap.json');

async function processImage(filePath, scale) {
    const image = await loadImage(filePath);
    const canvas = createCanvas(image.width * scale, image.height * scale);
    const ctx = canvas.getContext('2d');
    ctx.drawImage(image, 0, 0, image.width * scale, image.height * scale);

    const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height).data;
    let blockData = [];
    for (let y = 0; y < canvas.height; y++) {
        let row = [];
        for (let x = 0; x < canvas.width; x++) {
            let index = (y * canvas.width + x) * 4;
            let r = imageData[index];
            let g = imageData[index + 1];
            let b = imageData[index + 2];
            let closestBlock = findClosestBlock(r, g, b);
            row.push(closestBlock);
        }
        blockData.push(row);
    }
    // console.log(blockData);
    return blockData;
}

function findClosestBlock(r, g, b) {
    let closestBlock = 'minecraft:stone';
    let minDiff = Infinity;
    for (let block in blockMap) {
        let [br, bg, bb] = blockMap[block];
        let diff = Math.sqrt((r - br) ** 2 + (g - bg) ** 2 + (b - bb) ** 2);
        if (diff < minDiff) {
            minDiff = diff;
            closestBlock = block;
        }
    }
    return closestBlock;
}

async function CountImage(blockData) {
    // console.log(blockData);
    let blockMap = new Map();

    for (let y = 0; y < blockData.length; y++) {
        for (let x = 0; x < blockData[y].length; x++) {
            if (!blockMap.has(blockData[y][x])) {
                blockMap.set(blockData[y][x], 1);
            } else {
                let count = blockMap.get(blockData[y][x]);
                blockMap.set(blockData[y][x], count + 1);
            }
        }
    }
    // console.log(blockMap);
    return blockMap;
}

// 計算兩個 RGB 顏色之間的距離（歐幾里得距離）
function colorDistance(color1, color2) {
    return Math.sqrt(
        (color1[0] - color2[0]) ** 2 +
        (color1[1] - color2[1]) ** 2 +
        (color1[2] - color2[2]) ** 2
    );
}

async function sortAlternatives(blockName) {
    const selectedColor = blockMap[blockName];
    let sortedBlocks = Object.entries(blockMap)
        .map(([block, color]) => ({
            block,
            distance: colorDistance(selectedColor, color)
        }))
        .sort((a, b) => a.distance - b.distance); // 按距離排序
    return sortedBlocks;
}

module.exports = { processImage, CountImage, sortAlternatives };