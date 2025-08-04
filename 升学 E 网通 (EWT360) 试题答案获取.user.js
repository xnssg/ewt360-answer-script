// ==UserScript==
// @name         升学 E 网通 (EWT360) 试题答案获取
// @namespace    https://ewt.zhicheng233.top/examanswer
// @version      1.1
// @description  此脚本在 EWT 试题中获取试题答案喵~
// @match        https://web.ewt360.com/mystudy/
// @author       仅供学习交流，严禁用于商业用途，请于24小时内删除
// @icon         https://web.ewt360.com/favicon.ico
// @license      GNU General Public License
// @grant        GM_getValue
// @grant        GM_setValue
// @downloadURL  https://update.greasyfork.org/scripts/524802/%E5%8D%87%E5%AD%A6%20E%20%E7%BD%91%E9%80%9A%20%28EWT360%29%20%E8%AF%95%E9%A2%98%E7%AD%94%E6%A1%88%E8%8E%B7%E5%8F%96.user.js
// @updateURL    https://update.greasyfork.org/scripts/524802/%E5%8D%87%E5%AD%A6%20E%20%E7%BD%91%E9%80%9A%20%28EWT360%29%20%E8%AF%95%E9%A2%98%E7%AD%94%E6%A1%88%E8%8E%B7%E5%8F%96.meta.js
// ==/UserScript==

(function () {
    'use strict';

    // 获取当前日期并格式化
    const formatDate = (date) => {
        const year = date.getFullYear();
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const day = String(date.getDate()).padStart(2, '0');
        return `${year}.${month}.${day}`;
    };
    const currentDate = formatDate(new Date());

    // 配置常量
    const CONFIG = {
        BIZ_CODE_LIST: [205, 204, 201],
        API_TIMEOUT: 10000, // 请求超时时间(ms)
        SETTINGS_PANEL_STYLE: `
            .ewt-settings {
                position: fixed;
                top: 50%;
                left: 50%;
                transform: translate(-50%, -50%);
                background: white;
                padding: 20px;
                border-radius: 8px;
                box-shadow: 0 0 15px rgba(0,0,0,0.3);
                z-index: 10000;
                max-width: 90%;
                width: 500px;
                box-sizing: border-box;
            }
            .ewt-settings h1 {
                margin-top: 0;
                color: #333;
                font-size: 1.5rem;
            }
            .ewt-settings h2 {
                font-size: 1.2rem;
                color: #555;
            }
            .ewt-settings p {
                color: #666;
                line-height: 1.5;
            }
            .ewt-settings input {
                margin: 10px 0;
                padding: 8px;
                width: 100%;
                box-sizing: border-box;
                border: 1px solid #ddd;
                border-radius: 4px;
            }
            .ewt-settings button {
                margin: 5px;
                padding: 8px 16px;
                border: none;
                border-radius: 4px;
                cursor: pointer;
                transition: background-color 0.2s;
            }
            #saveSettings {
                background-color: #4CAF50;
                color: white;
            }
            #saveSettings:hover {
                background-color: #45a049;
            }
            #cancelSettings {
                background-color: #f44336;
                color: white;
            }
            #cancelSettings:hover {
                background-color: #d32f2f;
            }
            #donateButton {
                background-color: #FFC107;
                color: #333;
                font-weight: bold;
            }
            #donateButton:hover {
                background-color: #FFA000;
            }
            .ewt-settings .links {
                margin-top: 15px;
                padding-top: 15px;
                border-top: 1px solid #eee;
            }
            .ewt-settings a {
                color: #2196F3;
                text-decoration: none;
                margin-right: 10px;
            }
            .ewt-settings a:hover {
                text-decoration: underline;
            }
        `,
        DONATION_PANEL_STYLE: `
            .donation-panel {
                position: fixed;
                top: 50%;
                left: 50%;
                transform: translate(-50%, -50%);
                background: white;
                padding: 25px;
                border-radius: 10px;
                box-shadow: 0 0 20px rgba(0,0,0,0.3);
                z-index: 10001;
                max-width: 90%;
                width: 400px;
                text-align: center;
                box-sizing: border-box;
            }
            .donation-panel h2 {
                color: #e63946;
                margin-top: 0;
                border-bottom: 2px solid #f1faee;
                padding-bottom: 10px;
            }
            .donation-panel p {
                color: #457b9d;
                line-height: 1.6;
            }
            .qrcode-container {
                margin: 20px 0;
                padding: 15px;
                background: white;
                display: inline-block;
                border-radius: 5px;
                box-shadow: 0 0 10px rgba(0,0,0,0.1);
            }
            .donation-thanks {
                font-style: italic;
                color: #1d3557;
                margin: 20px 0;
            }
            #closeDonation {
                background-color: #1d3557;
                color: white;
                border: none;
                padding: 10px 20px;
                border-radius: 5px;
                cursor: pointer;
                margin-top: 10px;
                transition: background-color 0.3s;
            }
            #closeDonation:hover {
                background-color: #457b9d;
            }
        `,
        SETTINGS_BUTTON_STYLE: `
            position: fixed;
            top: 10px;
            right: 10px;
            z-index: 9999;
            padding: 8px 12px;
            background-color: #2196F3;
            color: white;
            border: none;
            border-radius: 4px;
            cursor: pointer;
            box-shadow: 0 2px 5px rgba(0,0,0,0.2);
            transition: background-color 0.2s;
        `,
        ANSWER_WINDOW_STYLE: `
            body {
                font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Arial, sans-serif;
                padding: 20px;
                max-width: 1200px;
                margin: 0 auto;
                color: #333;
            }
            h1 {
                color: #2c3e50;
                border-bottom: 2px solid #3498db;
                padding-bottom: 10px;
            }
            ul {
                list-style-type: none;
                padding: 0;
            }
            li {
                background: #f8f9fa;
                margin: 8px 0;
                padding: 12px;
                border-radius: 6px;
                border-left: 4px solid #3498db;
                transition: transform 0.2s;
            }
            li:hover {
                transform: translateX(5px);
            }
            details {
                margin-top: 8px;
                color: #666;
            }
            summary {
                cursor: pointer;
                color: #2980b9;
                font-weight: 500;
            }
            .footer {
                margin-top: 30px;
                padding-top: 15px;
                border-top: 1px solid #eee;
                color: #7f8c8d;
            }
            .donation-footer {
                margin-top: 20px;
                padding: 15px;
                background: #fff3cd;
                border-radius: 5px;
                text-align: center;
                color: #856404;
            }
            .donation-footer button {
                background-color: #ffc107;
                border: none;
                padding: 8px 16px;
                border-radius: 4px;
                cursor: pointer;
                margin-top: 10px;
                color: #333;
                font-weight: bold;
            }
        `
    };

    // 状态变量
    let state = {
        isLoading: false,
        getAnswerReportId: GM_getValue('getAnswerReportId', ''),
        bizCode: null,
        answerBizCode: null,
        paperId: null,
        platform: null,
        reportId: null,
        answerWindow: null // 存储答案窗口引用
    };

    /**
     * 创建捐赠面板
     * @returns {HTMLDivElement} 捐赠面板元素
     */
    const createDonationPanel = () => {
        const div = document.createElement('div');
        div.className = 'donation-panel';
        div.innerHTML = `
            <h2>支持开发者</h2>
            <p>如果您觉得本脚本对您有帮助，欢迎通过微信扫码捐赠支持开发者持续维护~</p>

            <div class="qrcode-container">
                ${printWechatQrcode()}
            </div>

            <p class="donation-thanks">您的每一份支持都是项目更新的动力！</p>
            <button id="closeDonation">关闭</button>
        `;

        // 添加样式
        const styleElement = document.createElement('style');
        styleElement.textContent = CONFIG.DONATION_PANEL_STYLE;
        document.head.appendChild(styleElement);

        return div;
    };

    /**
     * 显示捐赠面板
     */
    const showDonationPanel = () => {
        // 移除已存在的面板
        const existingPanel = document.querySelector('.donation-panel');
        if (existingPanel) existingPanel.remove();

        const panel = createDonationPanel();
        document.body.appendChild(panel);

        document.getElementById('closeDonation').addEventListener('click', () => {
            panel.remove();
        });
    };

    /**
     * 打印微信二维码的Base64图片
     * @returns {string} 包含Base64图片的img标签
     */
    function printWechatQrcode() {
        return `
            <img src="data:image/png;base64,待填写Base64转图片的内容处" 
                 alt="微信捐赠二维码" 
                 style="max-width: 200px; height: auto; border: none;">
        `;
    }

    /**
     * 创建设置面板
     * @returns {HTMLDivElement} 设置面板元素
     */
    const createSettingsPanel = () => {
        const div = document.createElement('div');
        div.className = 'ewt-settings';
        div.innerHTML = `
            <h1>EWT答案获取设置</h1>
            <h2>请填写已完成的reportId，用于越权 BypassAPI鉴权</h2>
            <h3>如何获得?</h3>
            <p>选择已经完成的试题（一定是已经完成的！！！最好是不用试卷类型的 ！！）,复制URL(网址)上的&reportId=后面的值,比如&reportId=19158466643xxxx 则复制19158466643xxxx</p>
            <div>
                <label for="reportId">已完成的reportId：</label>
                <input type="text" id="reportId" value="${state.getAnswerReportId}">
            </div>
            <div>
                <button id="saveSettings">保存</button>
                <button id="cancelSettings">取消</button>
                <button id="donateButton">支持开发者</button>
            </div>
            <div class="links">
                <p>Ver.1.1 ${currentDate}</p>
            </div>
        `;

        // 添加样式
        const styleElement = document.createElement('style');
        styleElement.textContent = CONFIG.SETTINGS_PANEL_STYLE;
        document.head.appendChild(styleElement);

        return div;
    };

    /**
     * 保存设置
     */
    const saveSettings = () => {
        const reportId = document.getElementById('reportId').value.trim();
        if (!reportId) {
            alert('请输入有效的reportId');
            return;
        }

        state.getAnswerReportId = reportId;
        GM_setValue('getAnswerReportId', reportId);

        const panel = document.querySelector('.ewt-settings');
        if (panel) panel.remove();

        alert('设置已保存');
    };

    /**
     * 显示设置面板
     */
    const showSettings = () => {
        // 移除已存在的面板
        const existingPanel = document.querySelector('.ewt-settings');
        if (existingPanel) existingPanel.remove();

        const panel = createSettingsPanel();
        document.body.appendChild(panel);

        document.getElementById('saveSettings').addEventListener('click', saveSettings);
        document.getElementById('cancelSettings').addEventListener('click', () => {
            panel.remove();
        });
        document.getElementById('donateButton').addEventListener('click', () => {
            panel.remove();
            showDonationPanel();
        });
    };

    /**
     * 添加设置按钮到页面
     */
    const addSettingsButton = () => {
        // 避免重复添加
        if (document.querySelector('#ewtSettingsButton')) return;

        const settingsButton = document.createElement('button');
        settingsButton.id = 'ewtSettingsButton';
        settingsButton.textContent = 'EWT脚本设置';
        settingsButton.style.cssText = CONFIG.SETTINGS_BUTTON_STYLE;
        settingsButton.addEventListener('click', showSettings);
        document.body.appendChild(settingsButton);
    };

    /**
     * 带超时的fetch请求
     * @param {string} url 请求URL
     * @param {object} options 请求选项
     * @param {number} timeout 超时时间(ms)
     * @returns {Promise} 请求结果
     */
    const fetchWithTimeout = (url, options, timeout = CONFIG.API_TIMEOUT) => {
        return Promise.race([
            fetch(url, options),
            new Promise((_, reject) =>
                setTimeout(() => reject(new Error('请求超时')), timeout)
            )
        ]);
    };

    /**
     * 获取QuestionId列表
     * @returns {Promise<Array>} QuestionId数组
     */
    const getQuestionIdList = async () => {
        const data = {
            client: 1,
            paperId: state.paperId,
            platform: state.platform,
            reportId: state.reportId,
            bizCode: state.bizCode,
            userId: ""
        };

        try {
            const response = await fetchWithTimeout(
                'https://web.ewt360.com/api/answerprod/common/answer/answerSheetInfo',
                {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify(data)
                }
            );

            if (!response.ok) {
                throw new Error(`HTTP错误: ${response.status}`);
            }

            const result = await response.json();

            if (!result.data?.questionInfoList) {
                throw new Error('获取试题列表失败，返回数据格式不正确');
            }

            const questionInfoList = result.data.questionInfoList;
            const questionIds = questionInfoList.map(question => {
                return question.parentQuestionId !== "0"
                    ? question.parentQuestionId
                    : question.questionId;
            });

            console.log('QuestionIds:', questionIds);
            return questionIds;
        } catch (error) {
            console.error('获取QuestionId失败:', error);
            alert(`获取试题ID失败: ${error.message}`);
            return [];
        }
    };

    /**
     * 获取题目答案和解析
     * @param {string} questionId 题目ID
     * @returns {Promise<Array|null>} 包含答案和解析的数组，失败返回null
     */
    const getAnswerAndMethodByQuestionId = async (questionId) => {
        const data = {
            questionId: questionId,
            paperId: state.paperId,
            reportId: state.getAnswerReportId,
            platform: state.platform,
            bizCode: state.answerBizCode,
        };

        try {
            const response = await fetchWithTimeout(
                'https://web.ewt360.com/api/answerprod/web/answer/simple/question/info',
                {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify(data)
                }
            );

            if (!response.ok) {
                throw new Error(`HTTP错误: ${response.status}`);
            }

            const result = await response.json();

            if (!result.data) {
                throw new Error('获取答案失败，返回数据为空');
            }

            let answers, method;

            // 处理有子题的情况
            if (result.data.childQuestions && result.data.childQuestions.length > 0) {
                answers = result.data.childQuestions.map(child => child.rightAnswer);
                method = result.data.childQuestions.map(child => child.method || '无解析');
            } else {
                answers = result.data.rightAnswer || '无答案';
                method = result.data.method || '无解析';
            }

            return [answers, method];
        } catch (error) {
            console.error(`获取答案失败 (QuestionId: ${questionId}):`, error);
            return null;
        }
    };

    /**
     * 打开答案窗口显示所有答案和解析
     * @param {Array} allAnswers 所有答案
     * @param {Array} allMethods 所有解析
     */
    const openAnswerPaper = (allAnswers, allMethods) => {
        if (!allAnswers.length) {
            alert('未获取到任何答案，请检查设置或网络连接');
            return;
        }

        // 判断是否为移动设备
        const isMobile = /Mobi|Android|iPhone|iPad|iPod/i.test(navigator.userAgent);
        const windowFeatures = isMobile
            ? 'width=800,height=600,scrollbars=yes'
            : 'width=1000,height=800,scrollbars=yes';

        // 保存新窗口引用
        state.answerWindow = window.open('', '_blank', windowFeatures);
        if (!state.answerWindow) {
            alert('浏览器阻止了弹出窗口，请允许弹出窗口后重试');
            return;
        }

        let htmlContent = `
            <!DOCTYPE html>
            <html lang="zh-CN">
            <head>
                <meta charset="UTF-8">
                <meta name="viewport" content="width=device-width, initial-scale=1.0">
                <title>试题答案与解析</title>
                <style>${CONFIG.ANSWER_WINDOW_STYLE}</style>
            </head>
            <body>
                <h1>试题答案与解析</h1>
                <p>共 ${allAnswers.length} 道题</p>
                <ul>
        `;

        for (let i = 0; i < allAnswers.length; i++) {
            const answer = Array.isArray(allAnswers[i])
                ? allAnswers[i].join('; ')
                : allAnswers[i];

            const method = Array.isArray(allMethods[i])
                ? allMethods[i].join('<br><br>')
                : allMethods[i];

            htmlContent += `
                <li>
                    <strong>第 ${i + 1} 题答案：</strong>${answer}
                    <details>
                        <summary>查看解析</summary>
                        <div>${method || '无解析内容'}</div>
                    </details>
                </li>
            `;
        }

        htmlContent += `
                </ul>
                <div class="footer">
                    <p>Ver.1.1 ${currentDate}</p>
                </div>
                <div class="donation-footer">
                    <p>觉得有用？请作者喝杯咖啡吧 ☕</p>
                    <button id="donateFromAnswer">支持开发者</button>
                </div>
                <script>
                    // 为答案窗口添加消息监听
                    window.opener.addEventListener('message', function(e) {
                        if (e.data === 'donationClosed') {
                            console.log('捐赠面板已关闭');
                        }
                    });

                    // 捐赠按钮点击事件
                    document.getElementById('donateFromAnswer').addEventListener('click', function() {
                        // 向主窗口发送显示捐赠面板的请求
                        window.opener.postMessage('showDonation', '${window.location.origin}');
                    });
                </script>
            </body>
            </html>
        `;

        state.answerWindow.document.write(htmlContent);
        state.answerWindow.document.close();
    };

    /**
     * 主逻辑函数
     */
    const main = async () => {
        if (state.isLoading) return;
        state.isLoading = true;

        try {
            // 显示加载状态
            const settingsButton = document.querySelector('#ewtSettingsButton');
            const originalText = settingsButton?.textContent;
            if (settingsButton) {
                settingsButton.textContent = '获取中...';
                settingsButton.disabled = true;
            }

            const questionIdsList = await getQuestionIdList();
            if (!questionIdsList.length) {
                throw new Error('未获取到任何试题ID');
            }

            // 确定有效的bizCode
            let foundValidBizCode = false;
            for (const testBizCode of CONFIG.BIZ_CODE_LIST) {
                state.answerBizCode = testBizCode;
                const testResult = await getAnswerAndMethodByQuestionId(questionIdsList[0]);
                if (testResult !== null) {
                    console.log(`有效的bizCode: ${testBizCode}`);
                    foundValidBizCode = true;
                    break;
                }
            }

            if (!foundValidBizCode) {
                throw new Error('未找到有效的bizCode，无法获取答案');
            }

            // 获取所有答案和解析
            const allAnswers = [];
            const allMethods = [];
            let lastParentQuestionId = null;

            for (const questionId of questionIdsList) {
                // 跳过重复的父题ID
                if (questionId === lastParentQuestionId) {
                    continue;
                }
                lastParentQuestionId = questionId;

                const answerAndMethod = await getAnswerAndMethodByQuestionId(questionId);
                if (answerAndMethod !== null) {
                    allAnswers.push(answerAndMethod[0]);
                    allMethods.push(answerAndMethod[1]);
                }
            }

            openAnswerPaper(allAnswers, allMethods);

        } catch (error) {
            console.error('主程序错误:', error);
            alert(`操作失败: ${error.message}`);
        } finally {
            // 恢复按钮状态
            const settingsButton = document.querySelector('#ewtSettingsButton');
            if (settingsButton) {
                settingsButton.textContent = 'EWT脚本设置';
                settingsButton.disabled = false;
            }
            state.isLoading = false;
        }
    };

    /**
     * 解析URL参数
     * @param {string} url URL字符串
     * @returns {object} 参数对象
     */
    const parseUrlParams = (url) => {
        const params = {};
        const queryString = url.split('?')[1];
        if (!queryString) return params;

        queryString.split('&').forEach(item => {
            const [key, value] = item.split('=');
            if (key) params[key] = value || '';
        });

        return params;
    };

    /**
     * 监听URL变化
     */
    const observeURLChange = () => {
        const observer = new MutationObserver(() => {
            const currentHref = window.location.href;
            if (currentHref.includes('reportId') && currentHref.includes('exam/answer')) {
                console.log('检测到答题页面，开始执行脚本...');
                observer.disconnect();

                // 解析URL参数
                const params = parseUrlParams(currentHref);

                // 验证必要参数
                if (!params.bizCode || !params.paperId || !params.platform || !params.reportId) {
                    alert('无法解析页面参数，请确保在正确的答题页面');
                    return;
                }

                // 更新状态变量
                state.bizCode = parseInt(params.bizCode, 10);
                state.paperId = params.paperId;
                state.platform = params.platform;
                state.reportId = params.reportId;

                console.log('解析到的参数:', {
                    bizCode: state.bizCode,
                    paperId: state.paperId,
                    platform: state.platform,
                    reportId: state.reportId
                });

                // 执行主逻辑
                main();
            }
        });

        // 开始观察文档变化
        observer.observe(document, { subtree: true, childList: true });
        console.log('正在监听页面变化...');
    };

    /**
     * 初始化函数
     */
    const init = () => {
        // 添加设置按钮
        addSettingsButton();

        // 添加跨窗口消息监听
        window.addEventListener('message', function(e) {
            // 验证消息来源
            if (e.source === state.answerWindow && e.data === 'showDonation') {
                showDonationPanel();
            }
        });

        // 检查是否需要设置reportId
        if (!state.getAnswerReportId) {
            alert('首次使用，请先设置已完成的reportId！');
            showSettings();
            return;
        }

        // 检查当前URL是否已经是答题页面
        if (window.location.hash.includes('exam/answer') && window.location.href.includes('reportId')) {
            console.log('已在答题页面，直接执行脚本...');
            const params = parseUrlParams(window.location.href);
            state.bizCode = parseInt(params.bizCode, 10);
            state.paperId = params.paperId;
            state.platform = params.platform;
            state.reportId = params.reportId;
            main();
        } else {
            // 否则监听URL变化
            observeURLChange();
        }
    };

    // 启动脚本
    init();

})();
