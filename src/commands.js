/* * 版权声明 厦门畅享信息技术有限公司, 版权所有 违者必究
 *
 *   @Copyright:  Copyright (c) 2019
 *   @Company:厦门畅享信息技术有限公司
 *   @Author: 李家其
 *   @Date: 2020-09-03 14:45:00
 * @Last Modified by: 李家其
 * @Last Modified time: 2020-09-08 17:38:47
 */

const vscode = require('vscode');
const util = require('./util');

Object.defineProperty(exports, "__esModule", { value: true });

// 定义shareui组件
const shareuiComponents = 'Button,Icon,Media,Panel,PanelBody,PanelFooter,PanelHead,PanelHeadLeft,PanelHeadRight,ButtonToolBar,Breadcrumb,Nav,Navbar,NavDropdown,NavItem,OuterTabs,Checkbox,CheckboxGroup,Calendar,CalendarRange,DateTime,FileUpload,Form,FormControl,FormControlFeedback,FormControlStatic,FormGroup,FormItem,Radio,RadioGroup,GroupChoose,ImageUploader,InputGroup,Select,Textarea,RichEditor,Transfer,FilterInput,Title,PicBox,TextBadge,ListGroupItem,TextTip,Tabs,SimpleTree,ImgGallery,Label,Thumbnail,Paragraph,ThumbnailList,Modal,Popover,Alert,ModalTool,ProgressStep,Spin,CloseButton';
const shareuiComponentsArr = shareuiComponents.split(",");
const registerCommands = {
    openAddBlock: (context, globalState, callback) => {
        return vscode.commands.registerCommand('share.openAddBlockWebview', function () {
            if (!vscode.workspace.rootPath) {
                util.showInfo("要使用插件，您需要先打开或创建一个应用！");
                return false;
            }
            //创建 block webview
            callback(context, globalState);
        })
    },
    openUseBlock: (context, globalState, callback) => {
        return vscode.commands.registerCommand('share.openUseBlockWebview', function () {
            if (!vscode.workspace.rootPath) {
                util.showInfo("要使用插件，您需要先打开或创建一个应用！");
                return false;
            }
            //使用 block webview
            callback(context, globalState);
        })
    },
    openPreview: (context, globalState, callback) => {
        return vscode.commands.registerCommand('share.openPreviewWebview', function (body) {
            //使用 预览区块
            if (!body) {
                util.showError("请不要单独执行命令使用！");
            }
            callback(context, globalState, body);
        })
    },
    openShareuiPreview: (context, globalState, callback) => {
        return vscode.commands.registerCommand('share.openShareuiPreviewWebview', function (body = {}) {
            const editor = vscode.window.activeTextEditor;
            if (editor) {
                let document = editor.document;
                let selection = editor.selection;
                let text = document.getText(selection); //获取选中的文本
                if (text && shareuiComponentsArr.includes(text)) {
                    body.componentName = text;
                    callback(context, globalState, body);
                } else {
                    //命令进入
                    body.componentName = '';
                    callback(context, globalState, body);
                }
            } else {
                //没有活动搞得窗口命令进入
                body.componentName = '';
                callback(context, globalState, body);
            }
        })
    },
    openDebuggMobile:(context, globalState, callback)=> {
        return vscode.commands.registerCommand('share.debugg-mobile', function (body = {}) {
            callback(context, globalState);
        })
    }
}

module.exports = registerCommands;