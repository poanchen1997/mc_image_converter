const testData = [
    ["minecraft:stone", "minecraft:oak_planks", "minecraft:glass"],
    ["minecraft:grass_block", "minecraft:gold_block", null]
];

const { generateNBT } = require('./nbtGenerator');
generateNBT(testData);
