const fs = require("hexo-fs");
const path = require("path");
const sharp = require("sharp");
const thumbhash = require("thumbhash");
const log = require("hexo-log").default({
  debug: false,
  silent: false,
});

// 输入目录（存放原始图片）
const inputDir = "./source/assets/post/";
// 输出目录（存放缩放后的图片）
const outputDir = "./source/assets/post/";
// 目标尺寸
const targetWidth = 100;
const targetHeight = 100;

// 生成文章封面缩略图base64编码
hexo.once("generateAfter", () => {
  log.info(`[Thumb Generate] Generating thumbhashs...`);

  // 确保输出目录存在
  if (!fs.existsSync(outputDir)) {
    log.info(`[Thumb Generate] Make dir ${outputDir}`);
    fs.mkdirSync(outputDir);
  }

  fs.readdir(inputDir, async (err, files) => {
    if (err) {
      log.error(
        `[Thumb Generate] Error reading input directory: ${inputDir} ${err}`,
      );
      return;
    }
    // 过滤出图片文件（支持 jpg, png, webp 等格式）
    const imageFiles = files.filter((file) =>
      /\.(jpg|jpeg|png|webp)$/i.test(file),
    );

    // 批量处理图片
    for (const file of imageFiles) {
      const inputPath = path.join(inputDir, file);
      const outputPath = path.join(outputDir, file);

      try {
        // 缩放图片
        const resizedImage = await sharp(inputPath)
          .resize(targetWidth, targetHeight, {
            fit: "inside", // 保持比例
            withoutEnlargement: true, // 小于100x100时不做处理
          })
          .toBuffer();

        // 将缩放后的图片转换为 thumbhash
        const { data, info } = await sharp(resizedImage)
          .raw()
          .ensureAlpha() // 确保图片有透明度通道
          .toBuffer({ resolveWithObject: true });

        const hash = thumbhash.rgbaToThumbHash(info.width, info.height, data);

        // 将 thumbhash 编码为 Base64
        const base64ThumbHash = Buffer.from(hash).toString("base64");

        // // 保存缩放后的图片和 thumbhash
        // await sharp(resizedImage).toFile(outputPath);
        // const imageConfig = {
        //     thumbhash: base64ThumbHash,
        //     url: inputPath
        // }
        fs.writeFileSync(`${outputPath}.thumbhash.txt`, base64ThumbHash);

        log.info(`[Thumb Generate] 图片 ${file} 处理完成，ThumbHash 已保存。`);
      } catch (error) {
        log.error(`[Thumb Generate] 处理图片 ${file} 时出错: ${error}`);
      }
    }
  });
});
