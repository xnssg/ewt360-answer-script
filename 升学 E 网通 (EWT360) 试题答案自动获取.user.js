// ==UserScript==
// @name         升学 E 网通 (EWT360) 试题答案获取
// @namespace    https://ewt.zhicheng233.top/examanswer
// @version      1.4.3
// @description  自动提取reportId，支持多种方式支持作者，修复捐赠面板无法打开问题
// @match        https://web.ewt360.com/mystudy/
// @author       xnssg
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
        REPORT_ID_PATTERN: /reportId=(\d+)/, // reportId格式正则（数字）
        OBSERVER_DELAY: 1000, // 观察者延迟检测时间(ms)
        DONATION_AMOUNTS: [5, 10, 20, 50, 100], // 推荐捐赠金额
        // 样式配置
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
                width: 600px;
                box-sizing: border-box;
                max-height: 80vh;
                overflow-y: auto;
            }
            .ewt-settings h1 {
                margin-top: 0;
                color: #333;
                font-size: 1.5rem;
            }
            .ewt-settings h2 {
                font-size: 1.2rem;
                color: #555;
                margin-bottom: 10px;
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
            .history-section {
                margin-top: 20px;
                padding-top: 15px;
                border-top: 1px solid #eee;
            }
            .history-list {
                max-height: 200px;
                overflow-y: auto;
                margin: 10px 0;
                border: 1px solid #eee;
                border-radius: 4px;
            }
            .history-item {
                padding: 8px 10px;
                border-bottom: 1px solid #eee;
                display: flex;
                justify-content: space-between;
                align-items: center;
            }
            .history-item:last-child {
                border-bottom: none;
            }
            .history-item:hover {
                background-color: #f9f9f9;
            }
            .history-info {
                flex: 1;
            }
            .history-id {
                font-family: monospace;
                font-size: 0.9rem;
                color: #333;
                word-break: break-all;
            }
            .history-date {
                font-size: 0.8rem;
                color: #999;
            }
            .history-actions button {
                padding: 4px 8px;
                margin: 0 2px;
                font-size: 0.8rem;
            }
            .usage-guide {
                background-color: #f8f9fa;
                padding: 15px;
                border-radius: 6px;
                margin: 15px 0;
            }
            .usage-guide h3 {
                margin-top: 0;
                color: #2c3e50;
                font-size: 1rem;
            }
            .usage-guide ol {
                margin-bottom: 0;
                padding-left: 20px;
            }
            .usage-guide li {
                margin: 5px 0;
            }
            .support-dev {
                margin-top: 15px;
                padding: 12px;
                background-color: #fff8e1;
                border-radius: 6px;
                border-left: 4px solid #ffc107;
            }
            .support-dev p {
                margin: 0 0 10px 0;
                color: #ff8f00;
                font-weight: 500;
            }
            .support-buttons {
                display: flex;
                gap: 8px;
                flex-wrap: wrap;
            }
            .support-button {
                padding: 6px 12px !important;
                font-size: 0.9rem !important;
                display: flex;
                align-items: center;
                gap: 5px;
            }
            .support-button:hover {
                transform: translateY(-2px);
                box-shadow: 0 2px 5px rgba(0,0,0,0.1);
            }
        `,
        // 简化捐赠面板样式，减少冲突可能性
        DONATION_PANEL_STYLE: `
            .donation-panel {
                position: fixed;
                top: 50%;
                left: 50%;
                transform: translate(-50%, -50%);
                background: white;
                padding: 20px;
                border-radius: 8px;
                box-shadow: 0 0 15px rgba(0,0,0,0.3);
                z-index: 2147483647; /* 使用最大可能的z-index */
                max-width: 90%;
                width: 500px;
                box-sizing: border-box;
            }
            .donation-panel h2 {
                color: #e63946;
                margin-top: 0;
                text-align: center;
            }
            .donation-methods {
                display: flex;
                justify-content: center;
                gap: 15px;
                margin: 15px 0;
            }
            .donation-method {
                text-align: center;
                padding: 10px;
                border: 1px solid #eee;
                border-radius: 5px;
                cursor: pointer;
            }
            .donation-method.active {
                border-color: #4CAF50;
                background-color: #f1f8e9;
            }
            .amount-selection {
                display: flex;
                flex-wrap: wrap;
                justify-content: center;
                gap: 10px;
                margin: 15px 0;
            }
            .amount-button {
                padding: 5px 15px;
                border: 1px solid #ddd;
                border-radius: 15px;
                cursor: pointer;
            }
            .amount-button.active {
                background-color: #4CAF50;
                color: white;
                border-color: #4CAF50;
            }
            .qrcode-container {
                text-align: center;
                margin: 15px 0;
            }
            .qrcode-container img {
                max-width: 250px;
                height: auto;
            }
            .donation-actions {
                display: flex;
                justify-content: center;
                gap: 10px;
                margin-top: 20px;
            }
            .donation-actions button {
                padding: 8px 20px;
                border: none;
                border-radius: 4px;
                cursor: pointer;
            }
            #closeDonation {
                background-color: #e0e0e0;
            }
            #donateConfirm {
                background-color: #e63946;
                color: white;
            }
            /* 备用面板样式 */
            .donation-fallback {
                position: fixed;
                top: 50%;
                left: 50%;
                transform: translate(-50%, -50%);
                background: white;
                padding: 20px;
                border-radius: 8px;
                box-shadow: 0 0 15px rgba(0,0,0,0.3);
                z-index: 2147483647;
                max-width: 90%;
                text-align: center;
            }
            .donation-thanks {
                font-style: italic;
                color: #1d3557;
                margin: 15px 0;
                padding: 10px;
                background-color: #f1f8e9;
                border-radius: 6px;
            }
            .other-support {
                margin-top: 20px;
                padding-top: 15px;
                border-top: 1px dashed #eee;
            }
            .other-support h3 {
                margin: 0 0 10px 0;
                color: #555;
                font-size: 1.1rem;
            }
            .support-options {
                display: flex;
                flex-wrap: wrap;
                justify-content: center;
                gap: 8px;
            }
            .support-option {
                padding: 6px 12px;
                background-color: #f5f5f5;
                border: none;
                border-radius: 4px;
                cursor: pointer;
                font-size: 0.9rem;
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
            transition: background-color 0.2s, transform 0.2s;
            display: flex;
            align-items: center;
            gap: 5px;
        `,
        NOTIFICATION_STYLE: `
            .ewt-notification {
                position: fixed;
                bottom: 20px;
                right: 20px;
                background: #4CAF50;
                color: white;
                padding: 15px 20px;
                border-radius: 4px;
                box-shadow: 0 2px 10px rgba(0,0,0,0.2);
                z-index: 10000;
                transform: translateY(100px);
                opacity: 0;
                transition: transform 0.3s, opacity 0.3s;
                max-width: 350px;
                display: flex;
                align-items: center;
                gap: 10px;
            }
            .ewt-notification.show {
                transform: translateY(0);
                opacity: 1;
            }
            .ewt-notification.question {
                background: #2196F3;
            }
            .ewt-notification.error {
                background: #f44336;
            }
            .ewt-notification.info {
                background: #2196F3;
            }
            .ewt-notification.success {
                background: #4CAF50;
            }
            .notification-icon {
                font-size: 1.2rem;
            }
            .notification-content {
                flex: 1;
            }
            .ewt-notification button {
                margin-left: 10px;
                background: rgba(255,255,255,0.3);
                border: none;
                color: white;
                padding: 3px 8px;
                border-radius: 3px;
                cursor: pointer;
            }
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
                display: inline-flex;
                align-items: center;
                gap: 5px;
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
        answerWindow: null, // 存储答案窗口引用
        lastAutoSavedReportId: GM_getValue('lastAutoSavedReportId', ''),
        reportIdHistory: GM_getValue('reportIdHistory', []), // reportId历史记录
        lastCheckTime: 0, // 上次检查时间，用于节流
        observerTimeout: null, // 观察者超时ID，用于防抖
        lastUrl: window.location.href, // 上次URL，用于检测变化
        donationStats: GM_getValue('donationStats', {
            totalDonors: 128, // 模拟数据
            totalAmount: 3560, // 模拟数据
            lastDonation: "刚刚" // 模拟数据
        })
    };

    /**
     * 显示通知消息
     * @param {string} message 消息内容
     * @param {string} type 消息类型，默认info，可选question、error、success
     * @param {object} buttons 按钮配置 {text: '按钮文本', callback: 回调函数}
     * @param {number} duration 显示时长(ms)，默认3000，0表示不自动关闭
     */
    const showNotification = (message, type = 'info', buttons = [], duration = 3000) => {
        // 添加通知样式
        if (!document.querySelector('#ewtNotificationStyle')) {
            const styleElement = document.createElement('style');
            styleElement.id = 'ewtNotificationStyle';
            styleElement.textContent = CONFIG.NOTIFICATION_STYLE;
            document.head.appendChild(styleElement);
        }

        // 定义不同类型的图标
        const icons = {
            info: 'ℹ️',
            success: '✅',
            error: '❌',
            question: '❓',
            heart: '❤️'
        };

        // 创建通知元素
        const notification = document.createElement('div');
        notification.className = `ewt-notification ${type}`;
        notification.innerHTML = `
            <span class="notification-icon">${icons[type] || icons.info}</span>
            <span class="notification-content">${message}</span>
        `;

        // 添加按钮
        buttons.forEach(btn => {
            const button = document.createElement('button');
            button.textContent = btn.text;
            button.addEventListener('click', () => {
                btn.callback();
                notification.remove();
            });
            notification.appendChild(button);
        });

        // 添加到页面
        document.body.appendChild(notification);

        // 显示动画
        setTimeout(() => {
            notification.classList.add('show');
        }, 10);

        // 自动关闭
        if (duration > 0) {
            setTimeout(() => {
                notification.classList.remove('show');
                setTimeout(() => {
                    notification.remove();
                }, 300);
            }, duration);
        }

        return notification;
    };

    /**
     * 创建爱心动画
     * @param {HTMLElement} container 容器元素
     */
    const createHeartAnimation = (container) => {
        const heart = document.createElement('div');
        heart.textContent = '❤️';
        heart.style.cssText = `
            position: absolute;
            top: -20px;
            left: 50%;
            transform: translateX(-50%);
            font-size: 1.5rem;
            opacity: 0;
            animation: heartFloat 1.5s ease-out forwards;
        `;
        container.appendChild(heart);

        // 添加动画样式
        const style = document.createElement('style');
        style.textContent = `
            @keyframes heartFloat {
                0% { transform: translateX(-50%) scale(0.5); opacity: 1; }
                50% { transform: translateX(-50%) scale(1.2) translateY(-15px); opacity: 1; }
                100% { transform: translateX(-50%) scale(0.8) translateY(-30px); opacity: 0; }
            }
        `;
        document.head.appendChild(style);

        // 动画结束后移除元素
        setTimeout(() => {
            heart.remove();
            style.remove();
        }, 1500);
    };

    /**
     * 处理其他支持方式
     * @param {string} type 支持类型
     */
    const handleOtherSupport = (type) => {
        try {
            switch(type) {
                case 'like':
                    showNotification('感谢您的支持！您的鼓励是我更新的动力 ❤️', 'success', [], 3000);
                    break;
                case 'share':
                    // 尝试复制到剪贴板
                    navigator.clipboard.writeText('推荐一个好用的工具：升学E网通试题答案获取脚本，地址：https://github.com/xnssg/ewt360-answer-script/blob/main/%E5%8D%87%E5%AD%A6%E6%98%93%E7%BD%91%E9%80%9A(EWT360)%E8%AF%95%E9%A2%98%E7%AD%94%E6%A1%88%E8%87%AA%E5%8A%A8%E8%8E%B7%E5%8F%96.user.js  镜像地址：https://github.com/xnssg/ewt360-answer-script/blob/main/%E5%8D%87%E5%AD%A6%E6%98%93%E7%BD%91%E9%80%9A(EWT360)%E8%AF%95%E9%A2%98%E7%AD%94%E6%A1%88%E8%87%AA%E5%8A%A8%E8%8E%B7%E5%8F%96.user.js')
                        .then(() => {
                            showNotification('分享链接已复制到剪贴板，感谢您的推荐！', 'success', [], 3000);
                        })
                        .catch(err => {
                            console.error('无法复制到剪贴板:', err);
                            showNotification('分享链接：升学E网通试题答案获取脚本地址：https://github.com/xnssg/ewt360-answer-script/blob/main/%E5%8D%87%E5%AD%A6%E6%98%93%E7%BD%91%E9%80%9A(EWT360)%E8%AF%95%E9%A2%98%E7%AD%94%E6%A1%88%E8%87%AA%E5%8A%A8%E8%8E%B7%E5%8F%96.user.js  镜像地址：https://github.com/xnssg/ewt360-answer-script/blob/main/%E5%8D%87%E5%AD%A6%E6%98%93%E7%BD%91%E9%80%9A(EWT360)%E8%AF%95%E9%A2%98%E7%AD%94%E6%A1%88%E8%87%AA%E5%8A%A8%E8%8E%B7%E5%8F%96.user.js', 'info', [], 5000);
                        });
                    break;
                case 'feedback':
                    window.open('https://github.com/xnssg/ewt360-answer-script', '_blank');
                    break;
                case 'star':
                    showNotification('感谢您的收藏！我们会持续改进脚本功能', 'success', [], 3000);
                    break;
            }
        } catch (error) {
            console.error('处理支持方式时出错:', error);
            showNotification('操作失败，请稍后重试', 'error', [], 3000);
        }

        // 关闭捐赠面板
        const panel = document.querySelector('.donation-panel, .donation-fallback');
        if (panel) panel.remove();
    };

    /**
     * 验证reportId格式是否有效
     * @param {string} reportId 要验证的reportId
     * @returns {boolean} 是否有效的reportId
     */
    const isValidReportId = (reportId) => {
        if (!reportId) return false;
        // 使用正则表达式验证格式
        return CONFIG.REPORT_ID_PATTERN.test(`reportId=${reportId}`);
    };

    /**
     * 保存reportId到历史记录
     * @param {string} reportId 要保存的reportId
     */
    const saveToHistory = (reportId) => {
        if (!isValidReportId(reportId)) return;

        // 检查是否已存在于历史记录中
        const exists = state.reportIdHistory.some(item => item.id === reportId);
        if (exists) return;

        // 添加新记录到历史开头
        const newRecord = {
            id: reportId,
            date: new Date().toLocaleString()
        };

        // 限制历史记录数量为10条
        state.reportIdHistory.unshift(newRecord);
        if (state.reportIdHistory.length > 10) {
            state.reportIdHistory = state.reportIdHistory.slice(0, 10);
        }

        // 保存到存储
        GM_setValue('reportIdHistory', state.reportIdHistory);
    };

    /**
     * 从历史记录中删除reportId
     * @param {string} reportId 要删除的reportId
     */
    const deleteFromHistory = (reportId) => {
        state.reportIdHistory = state.reportIdHistory.filter(item => item.id !== reportId);
        GM_setValue('reportIdHistory', state.reportIdHistory);

        // 如果当前使用的reportId被删除，清除当前设置
        if (state.getAnswerReportId === reportId) {
            state.getAnswerReportId = '';
            GM_setValue('getAnswerReportId', '');
        }

        // 更新设置面板中的历史记录
        const historyList = document.querySelector('.history-list');
        if (historyList) {
            historyList.innerHTML = renderHistoryList();
            bindHistoryActions();
        }
    };

    /**
     * 渲染历史记录列表HTML
     * @returns {string} 历史记录列表的HTML字符串
     */
    const renderHistoryList = () => {
        if (state.reportIdHistory.length === 0) {
            return '<div style="padding: 10px; text-align: center; color: #999;">暂无历史记录</div>';
        }

        return state.reportIdHistory.map(item => `
            <div class="history-item">
                <div class="history-info">
                    <div class="history-id">${item.id}</div>
                    <div class="history-date">${item.date}</div>
                </div>
                <div class="history-actions">
                    <button class="use-history" data-id="${item.id}">使用</button>
                    <button class="delete-history" data-id="${item.id}">删除</button>
                </div>
            </div>
        `).join('');
    };

    /**
     * 绑定历史记录操作按钮事件
     */
    const bindHistoryActions = () => {
        // 使用历史记录中的reportId
        document.querySelectorAll('.use-history').forEach(btn => {
            btn.addEventListener('click', () => {
                const reportId = btn.getAttribute('data-id');
                document.getElementById('reportId').value = reportId;
                state.getAnswerReportId = reportId;
                GM_setValue('getAnswerReportId', reportId);
                showNotification(`已选择使用该reportId`, 'success');
            });
        });

        // 删除历史记录中的reportId
        document.querySelectorAll('.delete-history').forEach(btn => {
            btn.addEventListener('click', () => {
                const reportId = btn.getAttribute('data-id');
                if (confirm(`确定要删除这个reportId吗？\n${reportId}`)) {
                    deleteFromHistory(reportId);
                }
            });
        });
    };

    /**
     * 自动提取并保存reportId
     * @param {string} reportId 要保存的reportId
     */
    const autoSaveReportId = (reportId) => {
        // 验证reportId有效性
        if (!isValidReportId(reportId)) {
            console.log('提取到无效的reportId格式:', reportId);
            showNotification('检测到疑似reportId但格式无效', 'error', [], 3000);
            return false;
        }

        // 检查是否为重复值
        if (reportId === state.getAnswerReportId) {
            console.log('提取到的reportId与当前使用的相同，无需更新');
            return false;
        }

        // 保存到历史记录
        saveToHistory(reportId);

        // 如果已有手动设置的reportId，询问用户是否更新
        if (state.getAnswerReportId) {
            showNotification(
                `检测到新的reportId，是否更新？`,
                'question',
                [
                    {
                        text: '更新',
                        callback: () => {
                            state.getAnswerReportId = reportId;
                            state.lastAutoSavedReportId = reportId;
                            GM_setValue('getAnswerReportId', reportId);
                            GM_setValue('lastAutoSavedReportId', reportId);
                            showNotification('reportId已更新', 'success', [], 2000);
                        }
                    },
                    {
                        text: '暂不',
                        callback: () => {}
                    }
                ],
                0 // 不自动关闭
            );
        } else {
            // 如果没有设置过，直接保存
            state.getAnswerReportId = reportId;
            state.lastAutoSavedReportId = reportId;
            GM_setValue('getAnswerReportId', reportId);
            GM_setValue('lastAutoSavedReportId', reportId);
            showNotification('已自动保存可用的reportId，现在可以获取答案了', 'success', [], 3000);
        }
        return true;
    };

    /**
     * 从当前页面中提取reportId
     * @returns {string|null} 提取到的reportId，失败则返回null
     */
    const extractReportIdFromPage = () => {
        // 1. 从URL中提取
        const urlMatch = window.location.href.match(CONFIG.REPORT_ID_PATTERN);
        if (urlMatch && urlMatch[1]) {
            return urlMatch[1];
        }

        // 2. 从页面链接中提取
        const links = document.querySelectorAll('a[href*="reportId="]');
        for (const link of links) {
            const href = link.getAttribute('href');
            const linkMatch = href.match(CONFIG.REPORT_ID_PATTERN);
            if (linkMatch && linkMatch[1]) {
                return linkMatch[1];
            }
        }

        // 3. 从页面脚本和元数据中提取
        const scripts = document.querySelectorAll('script');
        for (const script of scripts) {
            if (script.textContent.includes('reportId')) {
                const scriptMatch = script.textContent.match(CONFIG.REPORT_ID_PATTERN);
                if (scriptMatch && scriptMatch[1]) {
                    return scriptMatch[1];
                }
            }
        }

        return null;
    };

    /**
     * 检查当前页面是否为已完成的试卷页面
     * @returns {boolean} 是否为已完成的试卷页面
     */
    const isCompletedExamPage = () => {
        // 检查URL模式
        const urlPatterns = [
            /exam\/report/,       // 试卷报告页面
            /exam\/result/,       // 考试结果页面
            /exercise\/report/,   // 练习报告页面
            /paper\/report/,      // 试卷报告页面
            /task\/report/        // 任务报告页面
        ];

        if (urlPatterns.some(pattern => pattern.test(window.location.href))) {
            return true;
        }

        // 检查页面内容特征
        const pageTitles = [
            /考试报告/, /练习报告/, /测评结果/,
            /已完成/, /答题情况/, /得分/
        ];

        const titleElement = document.querySelector('title');
        if (titleElement) {
            const pageTitle = titleElement.textContent;
            if (pageTitles.some(pattern => pattern.test(pageTitle))) {
                return true;
            }
        }

        // 检查页面中是否有完成状态的标识
        const completionTexts = [
            /已完成/, /提交成功/, /评分完成/, /查看解析/
        ];

        const bodyText = document.body.textContent;
        if (completionTexts.some(pattern => pattern.test(bodyText))) {
            return true;
        }

        return false;
    };

    /**
     * 处理页面变化，尝试提取reportId
     */
    const handlePageChange = () => {
        // 节流处理：1秒内最多检查一次
        const now = Date.now();
        if (now - state.lastCheckTime < CONFIG.OBSERVER_DELAY) {
            return;
        }
        state.lastCheckTime = now;

        // 检查是否为已完成的试卷页面
        if (isCompletedExamPage()) {
            console.log('检测到可能包含reportId的完成页面，尝试提取...');

            // 提取reportId
            const reportId = extractReportIdFromPage();
            if (reportId) {
                console.log('成功提取到reportId:', reportId);
                autoSaveReportId(reportId);
            } else {
                console.log('未在页面中找到reportId');
                // 显示帮助提示
                showNotification(
                    '检测到完成的试卷页面，但未找到reportId',
                    'error',
                    [
                        {
                            text: '手动设置',
                            callback: showSettings
                        }
                    ],
                    5000
                );
            }
        }
    };

    /**
     * 监听页面变化，提取reportId
     */
    const observePageChanges = () => {
        // 初始检查
        handlePageChange();

        // 创建页面变化观察者（使用防抖处理）
        const observer = new MutationObserver(() => {
            // 清除之前的超时
            if (state.observerTimeout) {
                clearTimeout(state.observerTimeout);
            }

            // 防抖：页面稳定后再检查
            state.observerTimeout = setTimeout(() => {
                // 检查URL是否变化
                if (window.location.href !== state.lastUrl) {
                    state.lastUrl = window.location.href;
                    handlePageChange();
                } else {
                    // 页面内容变化时也检查
                    handlePageChange();
                }
            }, CONFIG.OBSERVER_DELAY);
        });

        // 开始观察文档变化
        observer.observe(document, {
            subtree: true,
            childList: true,
            attributes: true,
            characterData: true
        });
        console.log('已启动增强版页面监听，将自动提取reportId...');

        // 监听URL变化（History API）
        const originalPushState = history.pushState;
        history.pushState = function() {
            originalPushState.apply(this, arguments);
            handlePageChange();
        };

        const originalReplaceState = history.replaceState;
        history.replaceState = function() {
            originalReplaceState.apply(this, arguments);
            handlePageChange();
        };

        window.addEventListener('popstate', handlePageChange);
    };

    /**
     * 创建捐赠面板（简化版，减少出错可能）
     */
    const createDonationPanel = () => {
        console.log('尝试创建捐赠面板...');

        // 确保样式已加载
        if (!document.querySelector('#donationPanelStyle')) {
            const styleElement = document.createElement('style');
            styleElement.id = 'donationPanelStyle';
            styleElement.textContent = CONFIG.DONATION_PANEL_STYLE;
            document.head.appendChild(styleElement);
            console.log('捐赠面板样式已加载');
        }

        const div = document.createElement('div');
        div.className = 'donation-panel';
        div.id = 'mainDonationPanel';

        // 使用更简洁的HTML结构
        div.innerHTML = `
            <h2>支持开发者 ❤️</h2>
            <p>如果您觉得本脚本有用，欢迎支持开发者</p>

            <div class="donation-methods">
                <div class="donation-method active" data-method="wechat">
                    <div>微信支付</div>
                </div>
                <div class="donation-method" data-method="alipay">
                    <div>支付宝</div>
                </div>
            </div>

            <div>选择金额：</div>
            <div class="amount-selection">
                <button class="amount-button active" data-amount="5">¥5</button>
                <button class="amount-button" data-amount="10">¥10</button>
                <button class="amount-button" data-amount="20">¥20</button>
                <button class="amount-button" data-amount="50">¥50</button>
                <button class="amount-button" data-amount="100">¥100</button>
            </div>

            <div class="qrcode-container">
                ${printWechatQrcode()}
            </div>

            <div class="donation-thanks">
                <p>无论金额多少，都将受到衷心感谢！</p>
                <p>所有捐赠将用于脚本的维护和功能升级</p>
            </div>

            <div class="other-support">
                <h3>其他支持方式</h3>
                <div class="support-options">
                    <button class="support-option" data-type="like">👍 点个赞</button>
                    <button class="support-option" data-type="share">📤 分享推荐</button>
                    <button class="support-option" data-type="feedback">💬 反馈建议</button>
                </div>
            </div>

            <div class="donation-actions">
                <button id="closeDonation">关闭</button>
                <button id="donateConfirm">确认捐赠</button>
            </div>
        `;

        // 绑定事件（使用更可靠的事件委托）
        div.addEventListener('click', (e) => {
            // 处理捐赠方式切换
            if (e.target.closest('.donation-method')) {
                const method = e.target.closest('.donation-method');
                div.querySelectorAll('.donation-method').forEach(m => m.classList.remove('active'));
                method.classList.add('active');

                const methodType = method.getAttribute('data-method');
                const qrcodeContainer = div.querySelector('.qrcode-container');
                qrcodeContainer.innerHTML = methodType === 'wechat' ? printWechatQrcode() : printAlipayQrcode();
            }

            // 处理金额选择
            if (e.target.classList.contains('amount-button')) {
                div.querySelectorAll('.amount-button').forEach(b => b.classList.remove('active'));
                e.target.classList.add('active');
            }

            // 其他支持方式
            if (e.target.closest('.support-option')) {
                const type = e.target.closest('.support-option').getAttribute('data-type');
                handleOtherSupport(type);
            }

            // 关闭按钮
            if (e.target.id === 'closeDonation') {
                div.remove();
            }

            // 确认捐赠
            if (e.target.id === 'donateConfirm') {
                const header = div.querySelector('h2').parentNode || div;
                createHeartAnimation(header);
                showNotification('感谢您的支持！无论捐赠与否❤️', 'success', [], 3000);

                // 更新捐赠统计
                state.donationStats.totalDonors++;
                const activeAmount = div.querySelector('.amount-button.active');
                if (activeAmount) {
                    state.donationStats.totalAmount += parseInt(activeAmount.getAttribute('data-amount') || 10);
                } else {
                    state.donationStats.totalAmount += 10; // 默认值
                }
                state.donationStats.lastDonation = "刚刚";
                GM_setValue('donationStats', state.donationStats);

                div.remove();
            }
        });

        console.log('捐赠面板DOM创建完成');
        return div;
    };

    /**
     * 创建备用捐赠面板（极简版）
     */
    const createFallbackDonationPanel = () => {
        const div = document.createElement('div');
        div.className = 'donation-fallback';
        div.innerHTML = `
            <h3>支持开发者</h3>
            <p>感谢您的支持！您可以通过以下方式捐赠：</p>
            <div style="margin: 15px 0;">
                <img src="https://picsum.photos/200/200?grayscale" alt="捐赠二维码" style="max-width: 200px;">
            </div>
            <div style="margin: 10px 0;">
                <button class="support-option" data-type="share" style="margin-right: 5px;">📤 分享推荐</button>
                <button class="support-option" data-type="feedback">💬 反馈建议</button>
            </div>
            <button id="closeFallbackDonation">关闭</button>
        `;

        // 绑定事件
        div.addEventListener('click', (e) => {
            if (e.target.id === 'closeFallbackDonation') {
                div.remove();
            } else if (e.target.closest('.support-option')) {
                const type = e.target.closest('.support-option').getAttribute('data-type');
                handleOtherSupport(type);
            }
        });

        return div;
    };

    /**
     * 打印二维码（更可靠的实现）
     */
    function printWechatQrcode() {
        return `
            <img src="https://raw.github.com/xnssg/ewt360-answer-script/refs/heads/main/donation-wechat.png"
                 alt="微信捐赠二维码"
                 style="max-width: 250px; height: auto;">
            <p>微信扫码支持</p>
            `;
}
    function printAlipayQrcode() {
        try {
            return `
                <img src="https://picsum.photos/250/250?random=2"
                     alt="支付宝捐赠二维码"
                     onerror="this.src='https://picsum.photos/250/250?random=102'">
                <p>支付宝扫码支持</p>
            `;
        } catch (e) {
            console.error('支付宝二维码生成失败:', e);
            return '<div>支付宝捐赠二维码</div>';
        }
    }

    /**
     * 显示捐赠面板（增强-带错误重试和备用方案）
     */
    const showDonationPanel = () => {
        try {
            // 移除已存在的面板
            document.querySelectorAll('.donation-panel, .donation-fallback').forEach(el => el.remove());

            // 尝试创建主面板
            const panel = createDonationPanel();

            // 验证面板是否有效
            if (!panel || panel.nodeType !== 1) {
                throw new Error('创建的面板不是有效的DOM元素');
            }

            // 添加到页面并验证
            document.body.appendChild(panel);
            const addedPanel = document.querySelector('#mainDonationPanel');

            if (!addedPanel) {
                throw new Error('面板添加到页面失败');
            }

            console.log('捐赠面板已成功显示');

            // 测试点击事件是否正常
            setTimeout(() => {
                const testClick = new MouseEvent('click', {
                    bubbles: true,
                    cancelable: true,
                    view: window
                });
                addedPanel.dispatchEvent(testClick);
            }, 100);

        } catch (error) {
            // 详细错误日志
            console.error('捐赠面板主方案失败:', error.stack || error.message);

            // 尝试备用方案
            try {
                console.log('尝试备用捐赠面板...');
                const fallbackPanel = createFallbackDonationPanel();
                document.body.appendChild(fallbackPanel);
                showNotification('捐赠面板已简化显示', 'info', [], 3000);
            } catch (fallbackError) {
                console.error('备用方案也失败:', fallbackError);
                // 纯文本通知作为最后手段
                showNotification(
                    '捐赠功能暂时无法使用，您可以通过其他方式支持开发者',
                    'error',
                    [
                        {
                            text: '了解其他方式',
                            callback: () => handleOtherSupport('feedback')
                        }
                    ],
                    5000
                );
            }
        }
    };

    /**
     * 创建设置面板
     * @returns {HTMLDivElement} 设置面板元素
     */
    const createSettingsPanel = () => {
        const div = document.createElement('div');
        div.className = 'ewt-settings';
        div.innerHTML = `
            <h1>EWT答案获取设置</h1>

            <div class="usage-guide">
                <h3>使用指南</h3>
                <ol>
                    <li>完成任意一份试卷，系统会自动提取并保存reportId</li>
                    <li>在答题页面，脚本会自动识别并获取答案</li>
                    <li>您也可以手动输入或从历史记录中选择reportId</li>
                </ol>
            </div>

            <h2>已完成的reportId（自动提取）</h2>
            <p>脚本会自动检测并保存您完成的试卷reportId，无需手动输入</p>
            <div>
                <label for="reportId">当前使用的reportId：</label>
                <input type="text" id="reportId" value="${state.getAnswerReportId}">
            </div>

            <div class="history-section">
                <h2>历史记录</h2>
                <p>您可以从历史记录中选择或管理已保存的reportId</p>
                <div class="history-list">
                    ${renderHistoryList()}
                </div>
            </div>

            <div class="support-dev">
                <p>❤️ 支持开发者</p>
                <p>如果觉得本脚本有用，欢迎通过以下方式支持开发：</p>
                <div class="support-buttons">
                    <button class="support-button" id="settingsDonateButton">
                        💰 捐赠支持
                    </button>
                    <button class="support-button" id="settingsShareButton">
                        📤 分享推荐
                    </button>
                    <button class="support-button" id="settingsFeedbackButton">
                        💬 反馈建议
                    </button>
                </div>
            </div>

            <div>
                <button id="saveSettings">保存设置</button>
                <button id="cancelSettings">取消</button>
            </div>
            <div class="links">
                <p>Ver.1.4.3 ${currentDate}</p>
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

        // 验证格式
        if (!isValidReportId(reportId)) {
            alert('reportId格式无效，请检查后重试');
            return;
        }

        // 保存并添加到历史记录
        state.getAnswerReportId = reportId;
        GM_setValue('getAnswerReportId', reportId);
        saveToHistory(reportId);

        const panel = document.querySelector('.ewt-settings');
        if (panel) panel.remove();

        showNotification('设置已保存', 'success', [], 2000);
    };

    /**
     * 显示设置面板
     */
    const showSettings = () => {
        try {
            // 移除已存在的面板
            const existingPanel = document.querySelector('.ewt-settings');
            if (existingPanel) existingPanel.remove();

            const panel = createSettingsPanel();
            document.body.appendChild(panel);

            // 绑定历史记录操作
            bindHistoryActions();

            // 绑定支持作者相关按钮
            const donateButton = panel.querySelector('#settingsDonateButton');
            if (donateButton) {
                donateButton.addEventListener('click', () => {
                    panel.remove();
                    console.log('从设置面板点击了捐赠按钮');
                    showDonationPanel();
                });
            }

            const shareButton = panel.querySelector('#settingsShareButton');
            if (shareButton) {
                shareButton.addEventListener('click', () => {
                    handleOtherSupport('share');
                });
            }

            const feedbackButton = panel.querySelector('#settingsFeedbackButton');
            if (feedbackButton) {
                feedbackButton.addEventListener('click', () => {
                    handleOtherSupport('feedback');
                });
            }

            document.getElementById('saveSettings').addEventListener('click', saveSettings);
            document.getElementById('cancelSettings').addEventListener('click', () => {
                panel.remove();
            });
        } catch (error) {
            console.error('显示设置面板时出错:', error);
            showNotification('无法打开设置面板，请稍后重试', 'error', [], 3000);
        }
    };

    /**
     * 添加设置按钮到页面
     */
    const addSettingsButton = () => {
        try {
            // 避免重复添加
            if (document.querySelector('#ewtSettingsButton')) return;

            const settingsButton = document.createElement('button');
            settingsButton.id = 'ewtSettingsButton';
            settingsButton.innerHTML = '📝 EWT答案获取设置';
            settingsButton.style.cssText = CONFIG.SETTINGS_BUTTON_STYLE;
            settingsButton.addEventListener('click', showSettings);
            document.body.appendChild(settingsButton);
        } catch (error) {
            console.error('添加设置按钮时出错:', error);
        }
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
                    <p>Ver.1.4.3 ${currentDate}</p>
                </div>
                <div class="donation-footer">
                    <p>觉得有用？请作者喝杯咖啡吧 ☕</p>
                    <button id="donateFromAnswer">
                        ❤️ 支持开发者
                    </button>
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
            // 验证当前使用的reportId
            if (!isValidReportId(state.getAnswerReportId)) {
                throw new Error('当前使用的reportId无效，请检查设置');
            }

            // 显示加载状态
            const settingsButton = document.querySelector('#ewtSettingsButton');
            const originalText = settingsButton?.textContent;
            if (settingsButton) {
                settingsButton.innerHTML = '⌛ 获取中...';
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

            // 如果是reportId无效的错误，引导用户重新设置
            if (error.message.includes('reportId无效')) {
                showSettings();
            }
        } finally {
            // 恢复按钮状态
            const settingsButton = document.querySelector('#ewtSettingsButton');
            if (settingsButton) {
                settingsButton.innerHTML = '📝 EWT答案获取';
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
     * 监听URL变化，检测答题页面
     */
    const observeAnswerPage = () => {
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
        console.log('正在监听答题页面...');
    };

    /**
     * 初始化函数（增加捐赠面板预检测）
     */
    const init = () => {
        try {
            // 添加设置按钮
            addSettingsButton();

            // 添加跨窗口消息监听
            window.addEventListener('message', function(e) {
                // 验证消息来源
                if (e.source === state.answerWindow && e.data === 'showDonation') {
                    showDonationPanel();
                }
            });

            // 启动增强版页面监听，自动提取reportId
            observePageChanges();

            // 检查是否需要设置reportId
            if (!state.getAnswerReportId) {
                showNotification(
                    '首次使用，完成任意一份试卷后将自动获取reportId',
                    'info',
                    [
                        {
                            text: '使用帮助',
                            callback: showSettings
                        }
                    ],
                    5000
                );
            } else if (!isValidReportId(state.getAnswerReportId)) {
                // 检查当前reportId是否有效
                showNotification(
                    '当前使用的reportId无效，请更新',
                    'error',
                    [
                        {
                            text: '立即更新',
                            callback: showSettings
                        }
                    ],
                    0
                );
            } else {
                showNotification('EWT答案获取脚本已就绪', 'info', [], 2000);
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
                // 否则监听答题页面
                observeAnswerPage();
            }

            // 提前检测捐赠面板所需功能是否可用
            setTimeout(() => {
                try {
                    // 预检测DOM操作能力
                    const testDiv = document.createElement('div');
                    testDiv.id = 'donationTestDiv';
                    document.body.appendChild(testDiv);
                    const testElement = document.querySelector('#donationTestDiv');

                    if (testElement) {
                        testElement.remove();
                        console.log('DOM操作预检测通过');
                    } else {
                        console.warn('DOM操作可能存在限制');
                    }
                } catch (testError) {
                    console.warn('DOM环境检测警告:', testError);
                }
            }, 1000);

        } catch (error) {
            console.error('初始化脚本时出错:', error);
            showNotification('脚本初始化失败，请刷新页面重试', 'error', [], 5000);
        }
    };

    // 启动脚本
    init();

})();
