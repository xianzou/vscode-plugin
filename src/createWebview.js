/* * 版权声明 厦门畅享信息技术有限公司, 版权所有 违者必究
 *
 *   @Copyright:  Copyright (c) 2019
 *   @Company:厦门畅享信息技术有限公司
 *   @Author: 李家其
 *   @Date: 2020-09-03 14:19:17
 * @Last Modified by: 李家其
 * @Last Modified time: 2020-09-08 17:40:08
 */
const vscode = require('vscode');
const util = require('./util');
const messageHandler = require('./messageHandler');

const createAddBlockWebview = (context, globalState) => {
    const columnToShowIn = vscode.window.activeTextEditor
        ? vscode.window.activeTextEditor.viewColumn
        : undefined;

    let addBlockPanel = globalState.addBlockPanel;
    //如果当前panel存在
    if (addBlockPanel) {
        addBlockPanel.reveal(columnToShowIn);
    } else {
        addBlockPanel = vscode.window.createWebviewPanel('developBlock', "选择区块类型", vscode.ViewColumn.One, {
            enableScripts: true,
            retainContextWhenHidden: true,
            enableFindWidget: true,
        });
        addBlockPanel.webview.html = util.getWebViewContent(context, '/dist/page/develop-webview.html');

        let global = { projectPath: '', panel: addBlockPanel };

        addBlockPanel.webview.onDidReceiveMessage(message => {
            if (messageHandler[message.cmd]) {
                // cmd表示要执行的方法名称
                messageHandler[message.cmd](global, message);
            } else {
                util.showError(`未找到名为 ${message.cmd} 的方法!`);
            }
        }, undefined, context.subscriptions);

        globalState.addBlockPanel = addBlockPanel;

        //面板关闭
        addBlockPanel.onDidDispose(() => {
            addBlockPanel = null;
            globalState.addBlockPanel = null;
        }, null, context.subscriptions);
    }
}

const createUseBlockWebView = (context, globalState) => {
    const columnToShowIn = vscode.window.activeTextEditor
        ? vscode.window.activeTextEditor.viewColumn
        : undefined;

    let { useBlockPanel } = globalState;

    if (useBlockPanel) {
        useBlockPanel.reveal(columnToShowIn);
    } else {
        // const blockList = getBlock();
        useBlockPanel = vscode.window.createWebviewPanel(
            'useBlock',
            '使用区块',
            vscode.ViewColumn.One,
            {
                enableScripts: true,
                retainContextWhenHidden: true,
                enableFindWidget: true,
            }
        );

        useBlockPanel.webview.html = util.getWebViewContent(context, '/dist/page/use-webview.html');

        let global = { projectPath: '', panel: useBlockPanel };

        useBlockPanel.webview.onDidReceiveMessage(message => {
            if (messageHandler[message.cmd]) {
                // cmd表示要执行的方法名称
                messageHandler[message.cmd](global, message);
            } else {
                util.showError(`未找到名为 ${message.cmd} 的方法!`);
            }
        }, undefined, context.subscriptions);

        globalState.useBlockPanel = useBlockPanel;

        useBlockPanel.onDidDispose(() => {
            //面板关闭
            useBlockPanel = null;
            globalState.useBlockPanel = null;
        }, null, context.subscriptions);
    }

}


const createPreviewWebView = (context, globalState, body) => {
    const { homePage, categorie } = body;
    const columnToShowIn = vscode.window.activeTextEditor
        ? vscode.window.activeTextEditor.viewColumn
        : undefined;

    let { openPreviewPanel, currHomePage } = globalState;

    //更新src
    const updateWebview = () => {
        openPreviewPanel.webview.html = util.getPreviewWebViewContent(currHomePage, categorie);
        globalState.openPreviewPanel = openPreviewPanel;
        globalState.currHomePage = currHomePage;
    }

    if (openPreviewPanel) {
        if (currHomePage !== homePage) {
            //更新路径
            currHomePage = homePage;
            updateWebview();
        }
        openPreviewPanel.reveal(columnToShowIn);
    } else {
        currHomePage = homePage;
        openPreviewPanel = vscode.window.createWebviewPanel(
            'previewBlock',
            '预览区块',
            vscode.ViewColumn.One,
            {
                enableScripts: true,
                retainContextWhenHidden: true,
                enableFindWidget: true,
            }
        );

        updateWebview();
        let global = { projectPath: '', panel: openPreviewPanel };

        openPreviewPanel.webview.onDidReceiveMessage(message => {
            if (messageHandler[message.cmd]) {
                // cmd表示要执行的方法名称
                messageHandler[message.cmd](global, message);
            } else {
                util.showError(`未找到名为 ${message.cmd} 的方法!`);
            }
        }, undefined, context.subscriptions);

        openPreviewPanel.onDidDispose(() => {
            //面板关闭
            openPreviewPanel = null;
            globalState.openPreviewPanel = null;
            globalState.currHomePage = null;
        }, null, context.subscriptions);
    }
}

const shareUiComponentNames = {
    '通用': 'Button,Icon',
    '布局': 'Media,Panel,PanelBody,PanelFooter,PanelHead,PanelHeadLeft,PanelHeadRight,ButtonToolBar',
    '导航': 'Breadcrumb,Nav,Navbar,NavDropdown,NavItem,OuterTabs',
    '数据录入': 'Checkbox,CheckboxGroup,Calendar,CalendarRange,DateTime,FileUpload,Form,FormControl,FormControlFeedback,FormControlStatic,FormGroup,FormItem,Radio,RadioGroup,GroupChoose,ImageUploader,InputGroup,Select,Textarea,RichEditor,Transfer,FilterInput',
    '数据展示': 'Title,PicBox,TextBadge,ListGroupItem,TextTip,Tabs,SimpleTree,ImgGallery,Label,Thumbnail,Paragraph,ThumbnailList',
    '反馈': 'Modal,Popover,Alert,ModalTool,ProgressStep,Spin',
    '其他': 'CloseButton'
};

const createShareUiPreviewWebView = (context, globalState, body = {}) => {
    const { componentName = '' } = body;
    const columnToShowIn = vscode.window.activeTextEditor
        ? vscode.window.activeTextEditor.viewColumn
        : undefined;

    let { shareuiPanel, currComponentName } = globalState;

    //更新src
    const updateWebview = () => {
        const url = 'http://192.168.0.62:4002/shareui/styleguide/index.html';
        let shareuiComponentUrl = '';
        //匹配路径
        const classifyNameArr = Object.keys(shareUiComponentNames).filter(key => shareUiComponentNames[key].indexOf(componentName) !== -1);
        if (classifyNameArr.length && componentName) {
            shareuiComponentUrl = `${url}#/${classifyNameArr[0]}/${componentName}`
        } else {
            shareuiComponentUrl = `${url}#/快速入门`
        }

        shareuiPanel.webview.html = util.getShareUiPreviewWebViewContent(shareuiComponentUrl);
        globalState.shareuiPanel = shareuiPanel;
        globalState.currComponentName = componentName;
    }

    if (shareuiPanel) {
        if (currComponentName !== componentName) {
            //更新路径
            currComponentName = componentName;
            updateWebview();
        }
        shareuiPanel.reveal(vscode.ViewColumn.Two);
    } else {
        currComponentName = componentName;
        shareuiPanel = vscode.window.createWebviewPanel(
            'shareuiDoc',
            'shareui在线文档',
            vscode.ViewColumn.Two,
            {
                enableScripts: true,
                retainContextWhenHidden: true,
                enableFindWidget: true,
            }
        );

        updateWebview();
        let global = { projectPath: '', panel: shareuiPanel };

        shareuiPanel.webview.onDidReceiveMessage(message => {
            if (messageHandler[message.cmd]) {
                // cmd表示要执行的方法名称
                messageHandler[message.cmd](global, message);
            } else {
                util.showError(`未找到名为 ${message.cmd} 的方法!`);
            }
        }, undefined, context.subscriptions);

        shareuiPanel.onDidDispose(() => {
            //面板关闭
            shareuiPanel = null;
            globalState.shareuiPanel = null;
            globalState.currComponentName = null;
        }, null, context.subscriptions);
    }
}


const createdebugMobileWebview = (context, globalState) => {
    const columnToShowIn = vscode.window.activeTextEditor
        ? vscode.window.activeTextEditor.viewColumn
        : undefined;

    let addBlockPanel = globalState.addBlockPanel;
    //如果当前panel存在
    if (addBlockPanel) {
        addBlockPanel.reveal(columnToShowIn);
    } else {
        addBlockPanel = vscode.window.createWebviewPanel('debug', "本机远程调试", vscode.ViewColumn.One, {
            enableScripts: true,
            retainContextWhenHidden: true,
            enableFindWidget: true,
        });
        addBlockPanel.webview.html = util.getWebViewContent(context, '/dist/page/debug-mobile.html');

        let global = { projectPath: '', panel: addBlockPanel };

        addBlockPanel.webview.onDidReceiveMessage(message => {
            if (messageHandler[message.cmd]) {
                // cmd表示要执行的方法名称
                messageHandler[message.cmd](global, message);
            } else {
                util.showError(`未找到名为 ${message.cmd} 的方法!`);
            }
        }, undefined, context.subscriptions);

        globalState.addBlockPanel = addBlockPanel;

        //面板关闭
        addBlockPanel.onDidDispose(() => {
            addBlockPanel = null;
            globalState.addBlockPanel = null;
        }, null, context.subscriptions);
    }
}


module.exports = {
    createAddBlockWebview,
    createUseBlockWebView,
    createPreviewWebView,
    createShareUiPreviewWebView,
    createdebugMobileWebview
}