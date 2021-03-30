/* * 版权声明 厦门畅享信息技术有限公司, 版权所有 违者必究
 *
 *   @Copyright:  Copyright (c) 2019
 *   @Company:厦门畅享信息技术有限公司
 *   @Author: 李家其
 *   @Date: 2020-09-03 14:30:40
 * @Last Modified by: 李家其
 * @Last Modified time: 2020-09-03 16:23:44
 */

const vscode = require('vscode');
const util = require('./util');
/**
 * 存放所有消息回调函数，根据 message.cmd 来决定调用哪个方法，
 * 想调用什么方法，就在这里写一个和cmd同名的方法实现即可
 */
const messageHandler = {
    // 弹出提示
    alert(global, message) {
        util.showInfo(message.info);
    },
    // 显示错误提示
    error(global, message) {
        util.showError(message.info);
    },
    // 回调示例：获取工程名
    getProjectName(global, message) {
        invokeCallback(global.panel, message, util.getProjectName(global.projectPath));
    },
    createBlock(global, message) {
        util.creatBlock(message.body, global);
    },
    async getBlockData(global, message) {
        const res = await util.getBlockList();
        invokeCallback(global.panel, message, res);
    },
    previewBlock(global, message) {
        vscode.commands.executeCommand('share.openPreviewWebview', message.body);
    },
    installBlock(global, message) {
        util.showError("-.-`这个功能还没实现，过几个月再来吧！");
    },
    openDebug(global, message){
        util.openDebug(message.body, global);
    },
    closeDebug(global, message){
        util.closeDebug(message.body, global);
    }
}

/**
 * 执行回调函数
 * @param {*} panel 
 * @param {*} message 
 * @param {*} resp 
 */
function invokeCallback(panel, message, resp) {
    // 错误码在400-600之间的，默认弹出错误提示
    if (typeof resp == 'object' && resp.code && resp.code >= 400 && resp.code < 600) {
        util.showError(resp.message || '发生未知错误！');
    }
    panel.webview.postMessage({ cmd: 'vscodeCallback', cbid: message.cbid, data: resp });
}

module.exports = messageHandler;
