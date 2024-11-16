/*
 * Reference:
 * - [你好黑暗，我的老朋友 —— 为网站添加用户友好的深色模式支持 by Sukka]
 *   (https://blog.skk.moe/post/hello-darkmode-my-old-friend/)
 */
// 作为直接影响渲染的脚本，应该在最开始就加载，不应该defer
(() => {
  const darkmodeCss = document.getElementById("theme-dark-css");
  const darkModeStorageKey = "user-color-scheme";
  const snowEnableStorageKey = "snow-enable";

  /**
   * 设置 LocalStorage 的指定属性
   */
  const setLS = (k, v) => {
    try {
      localStorage.setItem(k, v);
    } catch (e) {
      // (此处不进行处理)
    }
  };
  /**
   * 移除 LocalStorage 的指定属性
   */
  const removeLS = (k) => {
    try {
      localStorage.removeItem(k);
    } catch (e) {
      // (此处不进行处理)
    }
  };
  /**
   * 获取 LocalStorage 的指定属性
   */
  const getLS = (k) => {
    try {
      return localStorage.getItem(k);
    } catch (e) {
      // 与 localStorage 中没有找到对应 key 的行为一致
      return null;
    }
  };

  /**
   * 获取当前生效的显示模式（深色/浅色）名称
   */
  const getModeFromCSSMediaQuery = () => {
    return window.matchMedia("(prefers-color-scheme: dark)").matches
      ? "dark"
      : "light";
  };

  /**
   * 校验key
   */
  const validColorModeKeys = {
    dark: true,
    light: true,
  };

  /**
   * 提交指定的深色/浅色显示模式的设置
   */
  const emitColorMode = (mode) => {
    let currentSetting = mode || getLS(darkModeStorageKey);
    const systemTheme = getModeFromCSSMediaQuery();
    // 在 html tag 上设置主题颜色，方便第三方插件读取使用
    document.documentElement.setAttribute(
      "data-theme",
      currentSetting || systemTheme,
    );
    // 检查是否无效或可以被忽略
    if (!validColorModeKeys[currentSetting] || currentSetting === systemTheme) {
      removeLS(darkModeStorageKey); //reset
      currentSetting = null;
    }
    switch (currentSetting) {
      case "dark":
        darkmodeCss.setAttribute("media", "all");
        darkmodeCss.removeAttribute("disabled");
        break;
      case "light":
        darkmodeCss.setAttribute("disabled", "disabled");
        break;
      default:
        darkmodeCss.setAttribute("media", "(prefers-color-scheme: dark)");
        darkmodeCss.removeAttribute("disabled");
        break;
    }
  };

  const emitSnowEnable = (enable) => {
    let state = enable || getLS(snowEnableStorageKey) || "true";
    const snowEnableEvent = new CustomEvent("OnSnowStateChange", {
      detail: {
        enable: state,
      },
    });
    document.dispatchEvent(snowEnableEvent);
  };

  const invertDarkModeObj = {
    dark: "light",
    light: "dark",
  };

  /**
   * 切换显示模式（深色/浅色）
   */
  const toggleColorMode = () => {
    let currentSetting = getLS(darkModeStorageKey);
    if (validColorModeKeys[currentSetting]) {
      currentSetting = invertDarkModeObj[currentSetting];
    } else {
      currentSetting = invertDarkModeObj[getModeFromCSSMediaQuery()];
    }
    setLS(darkModeStorageKey, currentSetting);
    return currentSetting;
  };

  const toggleSnowEnable = () => {
    let currentSetting = getLS(snowEnableStorageKey) || "true";
    let newSetting = currentSetting === "true" ? "false" : "true";
    setLS(snowEnableStorageKey, newSetting);
    return newSetting;
  };

  // 加载页面时即立刻提交一次
  emitColorMode();

  const krDarkInit = () => {
    const darkModeSwitchElement = document.getElementById("theme-toggle");
    darkModeSwitchElement.addEventListener("click", () => {
      emitColorMode(toggleColorMode());
    });
  };

  const snowInit = () => {
    // emitSnowEnable();
    const snowEnableSwitchElement = document.getElementById("snow-toggle");
    snowEnableSwitchElement.addEventListener("click", () => {
      emitSnowEnable(toggleSnowEnable());
    });
  };

  const init = () => {
    document.removeEventListener("DOMContentLoaded", init, false);
    window.removeEventListener("load", init, false);
    krDarkInit();
    snowInit();
  };

  if (document.readyState === "complete") {
    setTimeout(init);
  } else {
    document.addEventListener("DOMContentLoaded", init, false);
    window.addEventListener("load", init, false); //fallback
  }
})();
