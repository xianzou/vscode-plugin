const vscode = require('vscode');
const {commonTreeData,amoyTreeData} = require('../config/treeData');
  
class newTreeItem extends vscode.TreeItem {
    constructor(label, collapsibleState, command) {
        super(label, collapsibleState);
        this.command = command;
    }
    // @ts-ignore
    get tooltip() {
        return `${this.label}`;
    }
}

function aNodeWithIdTreeDataProvider(defaultTreeData) {
    return {
        getChildren: (el) => {
            const arr = [];
            const tree = el || defaultTreeData;
            for (let item in tree) {
                const activeItem = tree[item];
                arr.push(new newTreeItem(activeItem.name,vscode.TreeItemCollapsibleState.None,{
                    command: activeItem.command,
                    title: '',
                    arguments: []
                }))
            }
            
            return arr
        },
        getTreeItem: (el) => {
            return el;
        },
        getParent: () => {
            return {}
        }
    };
}

 function treeInit(){
    vscode.window.createTreeView('share_common_tool', {
        treeDataProvider: aNodeWithIdTreeDataProvider(commonTreeData),
        showCollapseAll: true
    });
    vscode.window.createTreeView('share_amoy_tool', {
        treeDataProvider: aNodeWithIdTreeDataProvider(amoyTreeData),
        showCollapseAll: true
    })
}

module.exports = {
    treeInit 
};