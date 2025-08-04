# ewt360-answer-script
# 升学E网通试题答案获取脚本
![GitHub stars](https://img.shields.io/github/stars/[xnssg]/[ewt360-answer-script
]?style=social)
![GitHub license](https://img.shields.io/github/license/[xnssg]/[ewt360-answer-script
])

一个用于在「升学E网通（EWT360）」平台自动获取试题答案和解析的用户脚本，支持快速查看当前试卷的所有答案。


## 📌 功能特性
- 自动解析当前答题页面的试题ID
- 一键获取所有试题的标准答案和详细解析
- 支持在新窗口展示答案，排版清晰易读
- 适配PC端和移动端浏览器
- 无需手动抓包，脚本自动处理API请求


## 📦 安装方法
### 前置条件
需要先在浏览器安装 **用户脚本管理器**（二选一）：
- Tampermonkey（推荐）：[Chrome商店](https://chrome.google.com/webstore/detail/tampermonkey/dhdgffkkebhmkfjojejmpbldmpobfkfo) | [Firefox商店](https://addons.mozilla.org/zh-CN/firefox/addon/tampermonkey/)
- Greasemonkey（仅Firefox）：[Firefox商店](https://addons.mozilla.org/zh-CN/firefox/addon/greasemonkey/)

### 安装脚本
1. 点击仓库中的脚本文件：[ewt360-exam-answer.user.js](https://github.com/[xnssg]/[ewt360-answer-script
]/blob/main/ewt360-exam-answer.user.js)
2. 点击页面中的 **Raw** 按钮（右上角），脚本管理器会自动识别并提示安装。
3. 在弹出的安装窗口中点击“安装”即可。


## 🚀 使用教程
1. 打开升学E网通官网，登录账号并进入答题页面（URL包含 `exam/answer` 和 `reportId`）。
2. 页面右上角会出现 **“EWT答案获取脚本设置”** 按钮，点击打开设置面板。
3. 按提示填写 **已完成试卷的reportId**（如何获取：选择已完成的试卷，复制URL中 `&reportId=` 后面的字符串）。
4. 保存设置后，脚本会自动解析当前试卷，弹出答案窗口展示所有试题答案和解析。

> ⚠️ 注意：请确保填写的是“已完成试卷”的reportId，否则可能无法获取答案。


## 📝 更新日志
- **v1.1**（[发布日期]）：2025/8/3
  - 优化捐赠二维码显示方式（支持Base64图片）
  - 修复部分场景下答案窗口无法弹出的问题
- **v1.0**（[发布日期]）：
  - 初始版本，实现基本的答案获取功能


## 🤝 支持与捐赠
如果脚本对你有帮助，欢迎通过以下方式支持开发者：
- 给仓库点一个 ⭐️ Star
- 分享给有需要的朋友
- 扫码捐赠（微信）：

  ![微信捐赠二维码](donation-wechat.png)  <!-- 若添加二维码图片，需先上传图片到仓库根目录 -->


## 📜 许可证
本项目采用 [BSD 3-Clause “New” or “Revised” License](LICENSE) 协议，仅供学习交流使用，严禁用于商业用途，请于24小时内删除。


## ❓ 常见问题
1. **Q：提示“未找到有效的reportId”怎么办？**  
   A：请确保填写的是“已完成试卷”的reportId，且格式正确（不含多余字符）。

2. **Q：答案窗口被浏览器拦截？**  
   A：请允许当前网站的弹出窗口（浏览器地址栏通常会有提示）。

3. **Q：脚本突然失效？**  
   A：可能是网站接口更新，请关注仓库更新或提交Issue反馈。


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
