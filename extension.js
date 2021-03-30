/* * 版权声明 厦门畅享信息技术有限公司, 版权所有 违者必究
 *
 *   @Copyright:  Copyright (c) 2019
 *   @Company:厦门畅享信息技术有限公司
 *   @Author: 李家其
 *   @Date: 2020-09-03 14:46:56
 * @Last Modified by: 李家其
 * @Last Modified time: 2020-09-08 17:41:24
 */

const vscode = require('vscode');
const CourseTreeProvider = require("./src/CourseTreeProvider");
const registerCommands = require("./src/commands");
const path = require('path');
const fs = require('fs');
const {
	createAddBlockWebview, createUseBlockWebView,
	createPreviewWebView, createShareUiPreviewWebView,createdebugMobileWebview
} = require("./src/createWebview");

function activate(context) {
	CourseTreeProvider.MyTreeProvider.initMyTreeList();
	vscode.window.setStatusBarMessage('你好，畅享信息的前端艺术家！');

	const globalState = {
		addBlockPanel: null,
		useBlockPanel: null,
		openPreviewPanel: null,
		currHomePage: '',
		shareuiPanel: null,
		currComponentName: ''
	};

	//新增block命令
	context.subscriptions.push(registerCommands.openAddBlock(context, globalState, createAddBlockWebview));
	//使用block命令
	context.subscriptions.push(registerCommands.openUseBlock(context, globalState, createUseBlockWebView));
	//预览区块
	context.subscriptions.push(registerCommands.openPreview(context, globalState, createPreviewWebView));

	context.subscriptions.push(registerCommands.openShareuiPreview(context, globalState, createShareUiPreviewWebView));

	context.subscriptions.push(registerCommands.openDebuggMobile(context, globalState, createdebugMobileWebview));

}
exports.activate = activate;

// this method is called when your extension is deactivated
function deactivate(context) {
	context.globalState.update('globalData', undefined);
}

module.exports = {
	activate,
	deactivate
}