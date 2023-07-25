;(function () {
  'use strict';

  const inBrowser = typeof window !== 'undefined'
  const baseChar = '阅' // 标准汉字
  let options = { // 参数
    /* platform
      browser-浏览器
      quickApp-快应用
      wxMini-微信小程序
      alipayMini-支付宝小程序
      alitbMini-淘宝小程序
    */
    platform: 'browser', // 平台
    /* id
      browser id 无需传
      quickApp id 需要传canvas对象 this.$element('canvas')
      wxMini id 需要传canvas组件唯一自定义id 'maCanvasx'，支持离屏 canvas 的版本无需传
      alipayMini id 需要传canvas组件唯一自定义id 'maCanvasx'，支持离屏 canvas 的版本无需传
      alitbMini id 需要传canvas组件唯一自定义id 'maCanvasx'，支持离屏 canvas 的版本无需传
    */
    id: '', // canvas 对象
    splitCode: '\r\n', // 段落分割符
    /* fast
      * 计算加速，默认 false
      * 按照容器宽度粗略计算固定每行字数，段落行不再通过 measureText 计算精确的字数
      * 浏览器不需要用，对于快应用、小程序等计算耗时较长的应用，如果对排版要求不那么高可考虑使用以提高速度
    */
    fast: false, // 是否计算加速
    width: 0, // 容器宽度-必传
    height: 0, // 容器高度-必传
    fontFamily: 'sans-serif', // 字体
    fontSize: 0, // 字号大小-章节内容-必传
    lineHeight: 1.4, // 行高-章节内容
    pGap: 0, // 段落首行和上一段落间距

    title: '', // 章节标题
    titleSize: 0, // 字号大小-章节标题
    titleHeight: 1.4, // 行高-章节标题
    titleWeight: 'normal', // 字重-章节标题
    titleGap: 0, // 标题和内容的间距-章节标题
  }

  // 获取指定元素的 CSS 样式
  const getStyle = (attr) => {
    if (!inBrowser) {
      return ''
    }
    if (getComputedStyle) {
      return getComputedStyle(document.documentElement)[attr]
    }
    return document.documentElement.currentStyle[attr] // ie
  }

  // 删除字符串中的空格
  const trimAll = (str) => {
    if (str) {
      return String(str).replace(/[\s]+/gim, '')
    }
    return ''
  }

  /**
   * 把文本内容转化成特定数组输出
   * @param {string} content 章节内容
   * @param {Object} option 参数
   * @return {Array} [] 输出转化好的行数组
  */
  function Reader(content, option) {
    const { width, height, fontFamily, fontSize, title, titleSize } = option
    if (!content) {
      return '无内容'
    }
    if (!width || Number(width) <= 0) {
      return '请传入容器宽度，值需要大于 0'
    }
    if (!height || Number(height) <= 0) {
      return '请传入容器高度，值需要大于 0'
    }
    if (!fontSize || Number(fontSize) <= 0) {
      return '请传入章节内容字号大小，值需要大于 0'
    }
    if (title && (!titleSize || Number(titleSize) <= 0)) {
      return '请传入章节标题字号大小，值需要大于 0'
    }

    options = { ...options, ...option }

    // 字体
    const rootFamily = getStyle('font-family')
    if (!fontFamily && rootFamily) {
      options.fontFamily = rootFamily
    }

    const lines = splitContent2lines(content) // 把内容拆成行数组
    const pages = joinLine2Pages(lines) // 把行聚合成页数组
    return pages
  }

  /**
   * 分行，将文本内容根据容器宽度拆分成行
   * @param {string} content 文本内容
   * @return {Array} [] 行数组
  */
  function splitContent2lines(content) {
    const { splitCode, width, fontSize, title } = options

    // 把文本拆成段落数组
    let hasTitle = false
    const reg = `[${splitCode}]+`
    const pList = content.split(new RegExp(reg, 'gim'))
      .map(v => {
        if (v === title) {
          hasTitle = true
          return v
        }
        return trimAll(v)
      })
      .filter(v => v)

    // 内容无标题需要额外加上标题
    if (!hasTitle) {
      pList.unshift(title)
    }

    // 计算1行能放多少个标准汉字
    const baseLen = Math.floor(width / fontSize)
    let char = ''
    for (let i = 0; i < baseLen; i++) {
      char += baseChar
    }
    const maxText = getText({ fontSize }, char, true)
    // console.log(111, '一行放多少个汉字', maxText.length)

    // 把段落拆成行
    let result = []
    pList.forEach((pText, index) => {
      result = result.concat(p2line(pText, index, maxText.length))
    })

    return result
  }

  /**
   * 把段落拆成行
   * @param {string} pText 段落内容
   * @param {number} index 段落索引
   * @param {number} maxLen 每行可放的最大字数
   * @return {Array} [] 行数组
  */
  function p2line(pText, index, maxLen) {
    const { fast, fontSize, title, titleSize, titleWeight } = options
    const isTitle = pText === title
    let p = pText
    let tag = 0
    let lines = []

    while (p) {
      tag += 1
      const pFirst = !isTitle && tag === 1 // 是否段落行首
      const sliceLen = pFirst ? maxLen - 2 : maxLen
      let lineText = p.slice(0, sliceLen)
      if (pFirst) {
        lineText = baseChar + baseChar + lineText
      }

      if (!isTitle && p.length <= maxLen) { // 少于行最大字数直接独立成行
        p = ''
      } else {
        if (!fast || isTitle) { // 计算加速
          lineText = getText({
            p,
            sliceLen,
            fontSize: isTitle ? titleSize : fontSize,
            weight: isTitle ? titleWeight : ''
          }, lineText)
        }
        p = p.slice(pFirst ? lineText.length - 2 : lineText.length)
      }

      // 去掉首行行首额外加的两个字符
      if (pFirst) {
        lineText = lineText.slice(2)
      }

      let center = true
      // 标点符号避头处理，掉文字到下一行
      if (p) {
        const { transLine, transP, canCenter } = transDot(lineText, p)
        lineText = transLine
        p = transP
        center = canCenter
      }

      // 段落中间行两端对齐，段落尾行和只有1行的不需要对齐
      if (isTitle || !p) {
        center = false
      }

      lines.push({
        isTitle, // 是否标题
        center, // 是否两端对齐
        pFirst: !isTitle && tag === 1, // 段落首行
        pIndex: index, // 段落索引
        lineIndex: tag, // 行索引
        text: lineText, // 行文字内容
      })
    }
    return lines
  }

  /**
   * 计算1行刚好能放下的文字
   * @param {Object} params 参数
   * @param {string} text 文本内容
   * @param {boolean} [base] 是否是最大标准字数计算
   * @param {number} [fontW] 计算出来的行文本宽度
   * @return {string} 行文本
  */
  function getText(params, text, base = false, fontW) {
    const { width, fontFamily } = options
    const { p, sliceLen, fontSize, weight } = params
    const getWidth = (text) => {
      return getTextWidth(text, fontSize, fontFamily, weight)
    }

    // 拿到过宽度的的传进来不再重复获取
    const textW = fontW || getWidth(text)
    if (textW === width) {
      return text
    }

    if (textW < width) {
      const add = p && p.slice(sliceLen, sliceLen + 1)
      if (!base && !add) { // 没有多余的字符了
        return text
      }
      const addText = base ? text + baseChar : text + add
      const addTextW = getWidth(addText)
      if (addTextW === width) {
        return addText
      }
      if (addTextW > width) {
        return text
      }
      return getText({ ...params, sliceLen: sliceLen + 1 }, addText, base, addTextW)
    }

    const cutText = text.slice(0, -1)
    if (!cutText) {
      return text
    }
    const cutTextW = getWidth(cutText)
    if (cutTextW <= width) {
      return cutText
    }
    return getText(params, cutText, base, cutTextW)
  }

  /**
   * 利用 canvas 绘制文本，计算文字宽度
   * @param {string} text 文字内容
   * @param {number} fontSize 字号大小
   * @param {string} fontFamily 字体
   * @param {string} [weight] 字重
   * @return {number} width 文字宽度
  */
  let canvas = null
  let ctx = null
  function getTextWidth(text, fontSize, fontFamily, weight) {
    if (!canvas) {
      canvas = createCanvas()
      ctx = canvas.getContext ? canvas.getContext('2d') : canvas
    }
    ctx.font = `${weight ? weight : 'normal'} ${fontSize}px ${fontFamily}`
    const { width } = ctx.measureText(text)
    return width
  }

  // 按照各平台 api 创建 canvas
  function createCanvas() {
    const { platform, id } = options
    switch (platform) {
      case 'quickApp': // 快应用
        return id
      case 'wxMini': // 微信小程序
        // 创建离屏 2D canvas，实例基础库 2.16.1 开始支持
        if (wx.createOffscreenCanvas) {
          return wx.createOffscreenCanvas({ type: '2d' })
        }
        // 创建 canvas 绘图上下文对象
        return wx.createCanvasContext(id)
      case 'alipayMini': // 支付宝小程序
        // 创建离屏 Canvas
        if (my.createOffscreenCanvas) {
          return my.createOffscreenCanvas()
        }
        return my.createCanvasContext(id)
      case 'alitbMini': // 淘宝小程序
        // 创建离屏 Canvas
        if (my.createOffscreenCanvas) {
          return my.createOffscreenCanvas()
        }
        return my.createCanvasContext(id)
      default: // browser 浏览器
        return document.createElement('canvas')
    }
  }

  /**
   * 分页
   * @param {Array} lines 行数组
   * @return {Array} [] 多页数组
  */
  function joinLine2Pages(lines) {
    const { height } = options

    // 计算1页能放多少标准行
    let maxLine = 1
    if (lines.length > 5) {
      const baseLineH = getLineHeight(lines[5])
      maxLine = Math.floor(height / baseLineH)
    }
    // console.log(222, '1页能放多少标准行', maxLine)

    let pageLines = lines.slice(0)
    let pages = []
    while (pageLines.length > 0) {
      const page = getPage(pageLines, maxLine)
      pages.push(page)
      pageLines = pageLines.slice(page.length)
    }

    return pages
  }

  /**
   * 把行聚合成页
   * @param {Array} lines 行数组
   * @param {number} maxLine 1页标准行数
   * @param {number} [pageHeight] 1页内容真实高度
   * @return {Array} [] 多行页数组
  */
  function getPage(lines, maxLine, pageHeight) {
    const { height, titleGap } = options
    const page = lines.slice(0, maxLine)
    const pageH = pageHeight || getPageHeight(page)
    let contHeight = height
    // 章节标题距离章节内容的间距
    if (lines && lines[0] && lines[0].isTitle) {
      contHeight = height - titleGap
    }

    if (pageH === contHeight) {
      return page
    }
    if (pageH < contHeight) {
      const add = maxLine + 1
      if (lines.slice(maxLine, add).length <= 0) { // 没有多余行
        return page
      }
      const addPage = lines.slice(0, add)
      const addPageH = getPageHeight(addPage)
      if (addPageH === contHeight) {
        return addPage
      }
      if (addPageH > contHeight) {
        return page
      }
      return getPage(lines, add, addPageH)
    }

    const cut = maxLine - 1
    if (cut <= 0) { // 少于最小行
      return page
    }
    const cutPage = lines.slice(0, cut)
    const cutPageH = getPageHeight(cutPage)
    if (cutPageH <= contHeight) {
      return cutPage
    }
    return getPage(lines, cut, cutPageH)
  }

  // 获取1行的高度
  const lineH = {}
  function getLineHeight(line) {
    // 计算过的直接返回
    const index = `${line.pIndex}_${line.lineIndex}`
    let theLineH = lineH[index]
    if (theLineH) {
      return theLineH
    }

    const { pGap, fontSize, lineHeight, titleSize, titleHeight } = options
    const size = line.isTitle ? titleSize : fontSize
    const height = line.isTitle ? titleHeight : lineHeight
    let gap = 0
    if (!line.isTitle && line.lineIndex === 1) { // 非标题 && 首行
      gap = pGap
    }
    theLineH = size * height + gap
    lineH[index] = theLineH
    return theLineH
  }

  // 获取1页最大行真实高度
  function getPageHeight(lines) {
    let pageH = 0
    lines.forEach(line => {
      pageH += getLineHeight(line)
    })
    return pageH
  }

  /**
   * 标点符号处理
   * @param {string} line 单行文字
   * @param {string} p 减去 line 的段落文字
   * @return {Object} {} 经过标点处理后的对象
  */
  function transDot(line, p) {
    let transLine = line // 转化后的行文字
    let transP = p // 转化过后剩下的段文字
    let canCenter = true // 是否可两端对齐

    // 下行行首是否是结尾标点
    if (isDot(p.slice(0, 1))) {
      transLine = line.slice(0, -1)
      transP = line.slice(-1) + p

      // 本行尾连续标点符号数量
      const endDot = getEndDot(line)
      if (endDot && endDot.length > 0) {
        let len = endDot.length
        // 3个及以上标点符号的不做处理，只有1个文字其他都是标点符号的不做处理
        if (len >= 3 || (len >= line.length - 2)) {
          return { transLine: line, transP: p, canCenter: true }
        }
        canCenter = false // 掉2个字符下去的不扩大间隙使两端对齐
        len = len + 1
        transLine = line.slice(0, -len)
        transP = line.slice(-len) + p
      }
    }

    return { transLine, transP, canCenter }
  }

  // 判断是否是结尾标点符号
  function isDot(code) {
    if (!code) {
      return false
    }
    // 35 个结束符 ，。：；！？、）》」】, . : ; ! ? ^ ) > } ] … ~ % · ’ ” ` - — _ | \ /
    const dots = ['ff0c', '3002', 'ff1a', 'ff1b', 'ff01', 'ff1f', '3001', 'ff09', '300b', '300d', '3011', '2c', '2e', '3a', '3b', '21', '3f', '5e', '29', '3e', '7d', '5d', '2026', '7e', '25', 'b7', '2019', '201d', '60', '2d', '2014', '5f', '7c', '5c', '2f']
    const charCode = code.charCodeAt(0).toString(16)
    if (dots.includes(charCode)) {
      return true
    }
    return false
  }

  // 获取字符串结尾连续标点符号
  function getEndDot(str) {
    // 35 个结束符 ，。：；！？、）》」】, . : ; ! ? ^ ) > } ] … ~ % · ’ ” ` - — _ | \ /
    // 15 个开始符（《「【 ( < { [ ‘ “ @ # ￥ $ & uff08
    return str.match(/[\uff0c|\u3002|\uff1a|\uff1b|\uff01|\uff1f|\u3001|\uff09|\u300b|\u300d|\u3011|\u002c|\u002e|\u003a|\u003b|\u0021|\u003f|\u005e|\u0029|\u003e|\u007d|\u005d|\u2026|\u007e|\u0025|\u00b7|\u2019|\u201d|\u0060|\u002d|\u2014|\u005f|\u007c|\u005c|\u002f\uff08|\u300a|\u300c|\u3010|\u0028|\u003c|\u007b|\u005b|\u2018|\u201c|\u0040|\u0023|\uffe5|\u0024|\u0026]+$/gi)
  }

  if (typeof define === 'function' && typeof define.amd === 'object' && define.amd) {
    define(function() { return Reader }) // 兼容 AMD、CMD 规范
  } else if (typeof module !== 'undefined' && module.exports) {
    module.exports = Reader // 兼容 CommonJs 规范
  } else {
    window.Reader = Reader // 注册全局变量，兼容直接使用 script 标签引入
  }
}());
