const fs = require('fs');
const path = require('path');
const nbt = require('prismarine-nbt');
const { dialog } = require('electron');

async function generateNBT(blockData) {
    const width = blockData[0].length;
    const height = blockData.length;
    const structureNBT = {
        DataVersion: { type: 'int', value: 3120 }, // Minecraft 1.20+
        size: { type: 'list', value: { type: 'int', value: [width, 1, height] } },
        palette: { type: 'list', value: { type: 'compound', value: [] } }, // ✅ **這裡改成空陣列**
        blocks: { type: 'list', value: { type: 'compound', value: [] } }   // ✅ **這裡改成空陣列**
    };
    // console.log("🔍 structureNBT 初始化:", JSON.stringify(structureNBT, null, 2));
    let palette = {};
    let paletteIndex = 0;

    await new Promise(resolve => {
        for (let y = 0; y < height; y++) {
            for (let x = 0; x < width; x++) {
                let blockName = blockData[y][x];
                // console.log(blockName);

                // **確保 blockName 是 string**
                if (typeof blockName !== 'string' || !blockName.trim()) {
                    console.warn(`⚠️ blockName 在 (${x},${y}) 無效，預設為 "minecraft:stone"`);
                    blockName = "minecraft:stone"; // **預設值**
                }

                // **確保 blockName 在 palette**
                if (!(blockName in palette)) {
                    palette[blockName] = paletteIndex++;

                    structureNBT.palette.value.value.push({
                        Name: { type: 'string', value: blockName },
                    });

                    console.log(`🎨 新增方塊: ${blockName} (索引 ${palette[blockName]})`);
                }

                // **確保 blocks 的數據完整**
                structureNBT.blocks.value.value.push({
                    pos: { type: 'list', value: { type: 'int', value: [x, 0, y] } },
                    state: { type: 'int', value: palette[blockName] },
                    id: { type: 'int', value: palette[blockName] }, // 方塊 ID
                });
            }
        }
        resolve();
    })


    console.log("✅ 轉換完成，準備寫入 NBT 文件...");
    // **寫入 NBT**
    try {
        let tag = nbt.comp({});
        tag.value = structureNBT;

        const buffer = nbt.writeUncompressed(tag);
        // const outputPath = path.join(__dirname, '../dist/structure.nbt');
        // fs.writeFileSync(outputPath, buffer);
        // 讓使用者選擇存檔位置
        const { filePath } = await dialog.showSaveDialog({
            title: 'save NBT file',
            defaultPath: path.join(__dirname, '../Samples/structure.nbt'),
            filters: [{ name: 'NBT Files', extensions: ['nbt'] }]
        });

        if (!filePath) {
            console.log('❌ Cancel');
            return null;
        }

        fs.writeFileSync(filePath, buffer);
        console.log(`✅ NBT 文件已成功寫入: ${filePath}`);
        return filePath;
        // console.log(`✅ NBT 文件已成功寫入: ${outputPath}`);
        // return outputPath;
    } catch (error) {
        console.error("❌ 生成 NBT 時發生錯誤:", error);
        throw error;
    }
}

module.exports = { generateNBT };