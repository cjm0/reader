# 阅读器 sdk

## 功能需求

**功能要求：**

- 支持横翻、竖翻阅读

- 支持文字两端对齐

- 标点符号避头

- 支持按段、按行插入广告

**平台要求：**

- 浏览器内核：PC 端浏览器、移动端浏览器、桌面端软件 Electron 以及手机 App 内嵌的 H5

- 小程序类：微信小程序、支付宝小程序、淘宝小程序、百度小程序、快应用以及其他平台小程序等

## 方案对比

方案1：利用容器自带排版功能实现

方案2：通过 js 计算排版分段分行，然后再组合成页

### 容器自带排版方案

1. 横翻分页：column 分栏布局实现，**快应用不支持，小程序不支持**

2. 标点符号避头：容器自带标点符号避头功能

3. 两端对齐：`text-align: justify;`，**快应用不支持，微信小程序 ios 上不支持**

4. 优点：速度快

5. 缺点：依赖平台排版渲染能力，兼容性差，无法做到统一

### js 计算排版方案

1. 横翻分页：通过容器宽高计算每页行数，每行字数

2. 标点符号避头：手动计算实现

3. 两端对齐：`justify-content: space-between;`，小程序、快应用、浏览器皆支持

4. 优点：不依赖平台，兼容性好

5. 缺点：计算需要时间，不同平台不同手机计算耗时不同（浏览器计算耗时最少，低端手机耗时更多）

## 功能实现

### 使用

![1.png](https://pic2.zhimg.com/80/v2-a6b116167fa9a8faad7fa4dea71d6b8d_1440w.webp)

### SDK 解释

转换章节内容示例

```js
import Reader from 'reader'

const content = {
  tit: "第一章，魂穿斗罗，震撼全场",
  cont: "第一章，魂穿斗罗，震撼全场\r\n        斗罗大陆，武魂殿\r\n一座巨大的战台上，数十道身影瘫倒在地，战台一片狼藉，并且夹杂着一阵阵痛苦的呻吟……\r\n战台周围的观众席上一片哗然，震撼的看着那名身穿蓝色短衫的少年。\r\n天水学院\r\n“哇啊，冰儿姐，唐三好厉害，刚刚那是什么招式？”\r\n水冰儿身穿蓝色短裙，面容精致，雪白修长的大长腿上穿着过膝长靴，御姐范十足。\r\n只见她柳眉微蹙，缓缓道：“不清楚，不过倒是听史莱克的同学提到过一种名为暗器的东西，也不知是不是这样？”\r\n史莱克学院\r\n院长弗兰德面容惊讶：“小刚，刚刚小三使用的是什么手段？”\r\n玉小刚摇了摇头：“不清楚，或许是他隐藏的底牌吧。”\r\n弗兰德笑道：“这个臭小子真是的，连我们都瞒！”\r\n“不过如此以来，武魂殿队员已经全军覆没，冠军是我们的了！”\r\n七宝琉璃宗\r\n宁宗主感叹一声：“真是个出乎意料的小家伙，先是硬撼胡列娜两人的武魂融合，再是用匪夷所思的手段放倒其他成员。”\r\n骨斗罗讥讽一笑：“若是没有意外，武魂殿这次是赔了夫人又折兵，足足三块魂骨啊，呵呵……”\r\n就在此刻，旁边的毒斗罗突然发话：“教皇冕下，唐三的毒连老夫都无法解开，若是再不投降，你们武魂殿这一代黄金种子，恐怕就危险了……”\r\n武魂殿高台之上\r\n一名身穿浅紫色贴身衣裙的佳人，头戴皇冠，气质高贵冷艳，高挑匀称的身材性感无比，只不过此时她的表情却充满了不甘，握住权杖的玉手微微一紧。\r\n裁决长老无奈的看着她，等待着她的命令……\r\n“呃哈……”\r\n就在此刻，武魂殿队伍中突然有一名成员清醒过来。\r\n墨尘艰难的起身，茫然的环视一圈，心中暗道：我擦，什么情况？！\r\n墨尘原本是蓝星三流学校的大学生，就在他欢天喜地的看着斗罗动漫时，一道奇怪的声音出现在他脑海中，再次醒来就出现在这里……\r\n【叮，震惊系统得到宿主同意，正在绑定中1％、33％、99％、100％！】\r\n墨尘愣了片刻，随即终于明白了自己现在的处境，他竟然穿越到了武魂殿队伍，并且还是在全大陆高级魂师学院精英大赛的冠军之争，躺在他对面的赫然是史莱克七怪！\r\n【叮，系统绑定成功，宿主拥有一个新手大礼包，请问是否开启？】\r\n“开！”\r\n【提升十级魂力、或升级武魂、或一枚腿步魂骨】\r\n墨尘毫不犹豫的道：升级武魂！\r\n既然自己来到了斗罗世界，那就绝对不能辜负上天给他的这次机会，天下权势和佳人他都要！\r\n现在最重要的是打入武魂殿核心，争取到比比东的支持，如此一来才有机会和挂王唐三一争。\r\n十级魂力固然重要，但却不能立马获得魂环，魂骨虽然重要，但远比不上本命武魂！\r\n【叮，武魂提升，宿主原来器武魂为剑，现在提升为神剑】\r\n嗡嗡嗡……\r\n一阵白光闪烁，墨尘彻底起身，身上浮现一柄巨大的剑影。\r\n武魂殿高台上\r\n七宝琉璃宗的剑斗罗身体一震：“这怎么可能？！”\r\n骨斗罗：“怎么了？”\r\n剑斗罗惊叹道：“刚刚老夫的武魂微微颤动，他的武魂品质恐怕在老夫之上！”\r\n宁风致面容一沉：“武魂殿的底蕴真是深不可测！”\r\n与此同时场面一片哗然，就连武魂殿中人也露出惊喜的神色，然后崇拜般的看向他们的教皇冕下，以为墨尘也是她的手段。\r\n墨尘之前可是武魂殿队伍中最不起眼的存在，也是魂力最低的存在，没想到今天却让他们大跌眼镜！\r\n比比东冷峻的俏脸先是微微一怔，美眸闪过一丝疑惑，随机嘴角微微上扬，无论如何，他是武魂殿的人，今日武魂殿威震天下就靠他了。\r\n就在此刻，毒斗罗突然发话：“墨尘虽然拥有底牌，但是唐三的毒已经深入他的经脉和五脏，若是再不治疗，恐怕也撑不了多久！”\r\n裁决长老看向比比东，等待她的命令。\r\n比比东面无表情的道：“除了墨尘，武魂殿其他六名成员退场。”\r\n话音刚落，不远处的玉小刚突然道：“史莱克学院，唐三退场。”\r\n唐三以一己之力硬撼胡列娜和其兄长的武魂融合技，然后又用最后的力量把八蛛魂骨残片割伤了武魂殿其他成员，身体早已不堪重负，倒地昏迷。\r\n宁风致淡淡道：“七宝有名，三曰魂。”\r\n呼呼呼……\r\n一个巨大的琉璃塔出现在众人头顶，唐三在史莱克众人的拥护中起身。\r\n比比东淡漠的看着他们：“解毒吧。”\r\n数息之后，唐三为武魂殿六名队伍解完毒，随后惊讶的望向武台，心中暗道：他竟然能抗住我的毒，隐藏的好深，不过就算如此，他也绝对不可能胜过戴老大和小舞六人。\r\n神风学院\r\n一名身穿血红色短期的绝色少女惊讶的看着墨尘，咬牙切齿的道：“墨尘加油，一定要把史莱克学院打败！”\r\n“很难……”风笑天摇了摇头：“现在就看他们谁先恢复，你们看奥斯卡和小舞已经起身了，而那墨尘仍然身负剧毒。”\r\n“别忘了，刚刚毒斗罗亲口说过，唐三的毒只有他能解。”\r\n火舞狠狠的瞪了他一眼：“你不行，不代表他不行，墨尘一定可以打败史莱克！”\r\n“哎……”风笑天摇了摇头，对火舞盲目的信任有些无奈，他虽然喜欢火舞，但却不吃醋，因为他知道，只要是与史莱克为敌，火舞都会无条件支持！\r\n武台上\r\n墨尘嘴唇发紫，气息紊乱，就连身上的武魂都开始若隐若现，根本无法正常行动。\r\n擦，怪不得这名武魂殿的成员先死了，不仅因为他实力最低，最重要的是这毒太狠了！\r\n【叮，系统收到来自天水学院震惊值99+】\r\n【叮，系统收到神风学院震惊值99+】\r\n【叮，系统收到武魂殿震惊值99+】\r\n【……】\r\n短短不到一息的功夫，墨尘就收到数万震惊值，脑海中浮现出系统兑换页面。\r\n【魂宗提升一级魂力999震惊值，万年级魂环9999，魂骨99999】\r\n高台上\r\n毒斗罗双手抱怀：“教皇冕下，我想提醒您一下，墨尘的武魂虽强，但也只能延缓毒的发作，若是再迟一些，恐怕……”\r\n比比东再次陷入两难境地，今天的情况早已出乎她的意料，本以为武魂殿会轻而易举的取胜，却没想到出现这么多变故！\r\n墨尘的潜力已经丝毫不逊于七宝琉璃宗的剑斗罗，甚至犹在其上，若是将来成长起来，必然会成为她的左膀右臂，助她完全掌握武魂殿，甚至一统天下！\r\n就算现在认输，武魂殿丢了面子和三块魂骨，但对于她来说，若是能收获墨尘，也不算输……\r\n比比东冷眼扫了一下史莱克学院，淡淡道：“武魂殿……”\r\n“等等！”\r\n就在教皇想要宣布命令时，武台上的墨尘突然打断了她的话，场面一度寂静。\r\n比比东俏脸骤然一冷，随后发现是墨尘时神情微微一缓：“墨尘，你还有何事？”\r\n“嗤……”墨尘嗤之一笑：“教皇姐姐还是先别急着下结论。”\r\n“万一这毒……我能解呢？”\r\n\r\n新书（斗罗：从迎娶比比东开始无敌）已经十几万字了，求支持呀！\r\n\r\n\r\n(本章完)\r\n"
}
const list = Reader(content.cont, {
  platform: 'browser', // 平台
  id: '', // canvas 对象
  splitCode: '\r\n', // 段落分割符
  fast: false, // 是否计算加速
  width: 327, // 容器宽度
  height: 511, // 容器高度
  fontSize: 20, // 段落字体大小
  lineHeight: 2.2, // 段落文字行高
  pGap: 8, // 段落间距
  title: content.tit, // 标题
  titleSize: 20 * 1.3, // 标题字体大小
  titleHeight: 1.8, // 标题文字行高
  titleWeight: 500, // 标题文字字重
  titleGap: 62, // 标题距离段落的间距
})
```

默认参数

```js
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
  * 是否计算加速，默认 false
  * 按照容器宽度粗略计算固定每行字数，段落行不再通过 measureText 计算精确的字数
  * 浏览器不需要用，快应用计算耗时较长，在 60~150ms 之间，对排版要求不那么高可考虑使用以此提高速度
*/
fast: false,
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
```

*可以直接把 js 复制出来自己修改扩展再用*

##  原理

### 横翻分页

1. 分段分行：

    - 拿到后端的章节内容，按照内容的段符号切割成段数组

    - 循环段数组，把每段按照容器宽度计算分成行数组，利用 `canvas measureText` 方法测量文本宽度

2. 聚行成页：

    - 按照容器高度计算每页能放多少行

    - 页高度 = 标题高度 + 行高度 + 间距

    - 标题高度 = 字体大小 * 行高

    - 行高度 = 字体大小 * 行高

    - 间距 = 段间距 + 标题和内容的间距

### 标点符号避头

1. 避头不避尾

2. 独立一行的不处理

3. 非段落首行，行头是结尾类型的标点符号：

    - 上一行行尾是文字的，掉一个字下来，上一行两端对齐间隙扩大

    - 上一行行尾1~2个标点符号的，标点符号前一个文字和标点符号一起掉下来，上一行不两端对齐，文字留空

    - 上一行行尾3个及以上标点符号的，不做处理

    - 上一行只有1个文字其他都是标点符号的，不做处理

### 两端对齐

行标签 p 设置 `display: flex;`，需要两端对齐的行加上 `justify-content: space-between;`

此行文字 text.split('') 切割成数组并用 for 循环 span 标签渲染

### 计算加速

传 `fast: true` 可跳过每行字数宽度计算以减少计算时间，正常不需要用到。

如果需要处理性能很差的低端手机计算耗时问题，可考虑传 `fast: true`，此时每行字数固定长度，对于一行有多个字符宽度不足一个汉字的情况两端对齐间隙会比较大，会降低阅读的精准一致性。

考虑好再用，是否牺牲少部分阅读性来换取计算速度提高。

## 性能表现

性能表现和计算有关，主要相关性包括浏览器版本、手机性能、平台内核、章节内容大小

常规章节不同性能手机整体在 50ms 以内

耗时统计：

- 浏览器：10ms 以内

- App 内嵌 H5：30ms 以内（低档手机）

- 快应用：10ms 以内

- 支付宝、淘宝小程序：10ms 以内

- 微信小程序：10ms 以内
