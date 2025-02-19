const fs = require("hexo-fs");
const path = require("path");
const sharp = require("sharp");
const thumbhash = require("thumbhash");
const log = require("hexo-log").default({
  debug: false,
  silent: false,
});

// 生成文章封面缩略图

hexo.once("generateAfter", () => {
  log.info(`[Thumb Generate] `);
  log.info(`[Thumb Generate] `);
  log.info(`[Thumb Generate] `);
});
