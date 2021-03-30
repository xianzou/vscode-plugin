/* * 版权声明 厦门畅享信息技术有限公司, 版权所有 违者必究
 *
 *   @Copyright:  Copyright (c) 2019
 *   @Company:厦门畅享信息技术有限公司
 *   @Author: 李家其
 *   @Date: 2020-09-03 14:46:29
 * @Last Modified by: 李家其
 * @Last Modified time: 2020-09-03 16:23:43
 */

"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const vscode = require("vscode");

class MyTreeProvider {
    constructor() { }

    static initMyTreeList() {
        let myTreeProvider = new MyTreeProvider();
        vscode.window.registerTreeDataProvider("SHARE_ID", myTreeProvider);
    }

    getTreeItem(element) {
        return element;
    }

    getChildren() {
        let trees = [];

        // let temp1 = new vscode.TreeItem("区块开发");
        let temp1 = new newTreeItem("区块开发", vscode.TreeItemCollapsibleState.None, {
            command: 'share.openAddBlockWebview',
            title: '',
            arguments: []
        });
        let temp2 = new newTreeItem("使用物料", vscode.TreeItemCollapsibleState.None, {
            command: 'share.openUseBlockWebview',
            title: '',
            arguments: []
        });
        // let temp3 = new vscode.TreeItem("使用模板");
        let temp3 = new newTreeItem("本机远程调试手机页面",vscode.TreeItemCollapsibleState.None,{
            command: 'share.debugg-mobile',
            title: '',
            arguments: []
        });
        trees.push(temp1);
        trees.push(temp2);
        trees.push(temp3);

        //执行命令
        return Promise.resolve(trees);
    }
}

class newTreeItem extends vscode.TreeItem {
    constructor(label, collapsibleState, command) {
        super(label, collapsibleState);
        this.command = command;
    }
    get tooltip() {
        return `${this.label}`;
    }
}

exports.MyTreeProvider = MyTreeProvider;