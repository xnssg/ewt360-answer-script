# 升学E网通试题答案获取脚本研究项目

![GitHub stars](https://img.shields.io/github/stars/[xnssg]/[ewt360-answer-script]?style=social)
![GitHub license](https://img.shields.io/github/license/[xnssg]/[ewt360-answer-script])

一个用于在「升学E网通（EWT360）」平台自动获取试题答案和解析的用户脚本，支持快速查看当前试卷的所有答案，专为学习交流设计。


## 📌 功能特性
- 自动解析当前答题页面的试题ID，无需手动抓包
- 一键获取所有试题的标准答案和详细解析，支持新窗口展示，排版清晰易读
- 内置设置面板，可便捷配置`reportId`等参数
- 适配PC端和移动端主流浏览器（Chrome、Firefox等）
- 支持捐赠功能，可通过微信扫码支持开发者持续维护
- 界面样式优化，设置面板和答案窗口均采用现代设计，提升使用体验
- 自动处理API请求，内置10秒超时保护，避免请求无响应


## 📌 改进功能方向（挖坑）
1. 用户体验细节待完善
reportId 自动提取：目前需要用户手动复制 URL 中的 reportId，对非技术用户不够友好。可考虑自动解析当前页面 URL 中的 reportId 并填充到设置面板，减少用户操作成本

2.答案展示优化：当前答案窗口仅展示试题、答案和解析，可增加更多实用功能，例如：支持复制答案或打印功能




## 📦 安装方法

### 前置条件
需先在浏览器安装**用户脚本管理器**（二选一）：
- Tampermonkey（推荐）：
  - [Chrome商店](https://chrome.google.com/webstore/detail/tampermonkey/dhdgffkkebhmkfjojejmpbldmpobfkfo)
  - [Firefox商店](https://addons.mozilla.org/zh-CN/firefox/addon/tampermonkey/)
- Greasemonkey（仅Firefox）：
  - [Firefox商店](https://addons.mozilla.org/zh-CN/firefox/addon/greasemonkey/)


### 安装脚本
1. 点击仓库中的脚本文件：[ewt360-exam-answer.user.js](https://github.com/[xnssg]/[ewt360-answer-script]/blob/main/ewt360-exam-answer.user.js)
2. 点击页面右上角的**Raw**按钮，脚本管理器会自动识别并弹出安装提示
3. 在弹出的安装窗口中点击“安装”即可完成


## 🚀 使用教程
1. **打开目标页面**：登录升学E网通官网，进入答题页面（URL需包含 `exam/answer` 和 `reportId`，例如：`https://web.ewt360.com/mystudy/exam/answer?reportId=123456`）
   
2. **打开设置面板**：页面右上角会显示**“EWT答案获取脚本设置”**按钮（蓝色背景，白色文字），点击打开设置面板

3. **配置reportId**：
   - 如何获取`reportId`？选择**已完成的试卷**，复制URL中 `&reportId=` 后面的字符串（例如URL中的`123456`）
   - 将复制的`reportId`粘贴到设置面板的输入框中

4. **获取答案**：点击“保存设置”，脚本会自动解析试卷信息，弹出新窗口展示所有试题的答案和解析


> ⚠️ 重要提示：
> - 仅支持**已完成试卷**的`reportId`，未完成试卷无法获取答案
> - 若弹出窗口被拦截，请在浏览器地址栏允许当前网站的弹出窗口权限


## 📝 更新日志
- **v1.1**（2025/8/3）：
  - 优化捐赠二维码显示方式（支持Base64图片直接展示）
  - 修复部分场景下答案窗口无法弹出的问题
  - 增强设置面板样式，提升移动端适配性
- **v1.0**：
  - 初始版本，实现基本的答案获取功能
  - 支持设置面板和答案窗口基础功能


## ❓ 常见问题
1. **Q：提示“未找到有效的reportId”怎么办？**  
   A：请检查：① 是否填写了**已完成试卷**的`reportId`；② 输入的字符串是否包含多余字符（如空格、问号）；③ 页面URL是否确实包含`reportId`参数。

2. **Q：答案窗口被浏览器拦截？**  
   A：浏览器地址栏通常会显示拦截提示，点击提示并选择“允许弹出窗口”即可。

3. **Q：脚本安装后不显示设置按钮？**  
   A：① 确认当前页面URL为`https://web.ewt360.com/mystudy/`（脚本仅匹配该域名）；② 检查脚本管理器中该脚本是否已启用；③ 刷新页面重试。

4. **Q：脚本突然失效？**  
   A：可能是升学E网通更新了接口或页面结构，请关注仓库更新或提交Issue反馈。


## 🤝 支持与捐赠
如果脚本对您有帮助，欢迎通过以下方式支持开发者：
- 给仓库点一个 ⭐️ Star
- 分享给有需要的朋友
- 微信扫码捐赠：

  ![微信捐赠二维码](donation-wechat.png)  <!-- 若添加二维码图片，需先上传图片到仓库根目录 -->


## 🛠️ 贡献代码
欢迎提交PR（Pull Request）改进脚本，流程如下：
1. Fork本仓库
2. 新建分支（`git checkout -b feature/xxx`）
3. 提交修改（`git commit -m "添加xxx功能"`）
4. 推送到分支（`git push origin feature/xxx`）
5. 打开Pull Request


## 📞 联系作者
- 如有问题或建议，可在仓库提交 [Issue](https://github.com/[xnssg]/[ewt360-answer-script]/issues)
- 邮箱：[xnssg@github-xnssg.aleeas.com]


## 📜 许可证
本项目采用 [BSD 3-Clause “New” or “Revised” License](LICENSE) 协议，仅供学习交流使用，严禁用于商业用途，请于24小时内删除。
