const fs = require('fs');
const os = require('os');
const path = require('path');
const vscode = require("vscode");
const formatJson = require('format-json-pretty');
const exec = require('child_process').exec;
const Request = require("request-light");
const shell =require('shelljs');

//驼峰大写转-
function underline(str) {
    return str.replace(/\B([A-Z])/g, '-$1').toLowerCase()
}

function getFile(filePath) {
    return new Promise(function (resolve) {
        (function waitSearch() {
            if (fs.existsSync(filePath)) {
                return resolve(true)
            };
            setTimeout(waitSearch, 500);
        })();
    });

}

const util = {
    async getBlockList() {
        let blockList = [];
        try {
            const link = 'http://192.168.0.62:6001/@share-material/shareui-material@latest/build/materials.json';
            const middlewareServerPath = 'http://192.168.0.62:6002/getMaterials';

            const data = await Request.xhr({
                type: 'get',
                url: `${middlewareServerPath}?currMaterialsUrl=${encodeURIComponent(link)}`,
            })
            if (data.responseText) {
                const res = JSON.parse(data.responseText);
                blockList = res.data.blocks;
            }
        } catch (error) {
            console.log("error>>>>", error);
        }
        return blockList;
    },
    async creatBlock(body, global) {
        const creatProjectUrl = path.join(`${vscode.workspace.rootPath}/${body.blockName}`);

        //判断要创建的文件是否存在
        if (fs.existsSync(creatProjectUrl)) {
            this.showInfo(`${body.blockName}已经存在，请更换区块名称！`);
            return false;
        }

        let terminalA = vscode.window.createTerminal({ name: "创建区块" });
        terminalA.show(true);
        let str = `git clone http://192.168.0.184:20000/share-material/shareui-material-block-template.git ${body.blockName}`;
        if (body.categorieList === 'jquery') {
            str = `git clone http://192.168.0.184:20000/share-material/shareui-material-block-template-jquery.git ${body.blockName}`;
        }
        if (body.categorieList === '移动端') {
            str = `git clone http://192.168.0.184:20000/share-material/shareui-material-block-template-mobile.git ${body.blockName}`;
        }
        const repository = `http://192.168.0.184:20000/share-material/blocks/${body.blockName.toLowerCase()}`;
        try {
            terminalA.sendText(str); //执行命令
            terminalA.sendText(`cd ${body.blockName}`); //执行命令
            //修改git信息
            const currPackageUrl = path.join(`${vscode.workspace.rootPath}/${body.blockName}`, `./package.json`);
            const hasPackageFile = await getFile(currPackageUrl);
            if (hasPackageFile) {
                terminalA.sendText(`git checkout --orphan  new_branch`);

                terminalA.sendText(`git add -A`);

                terminalA.sendText(`git commit -am "init project git"`);

                terminalA.sendText(`git branch -D master`);

                terminalA.sendText(` git branch -m master`);

                terminalA.sendText(`git remote set-url origin ${repository}`);

                //修改配置文件
                fs.readFile(currPackageUrl, 'utf8', function (err, data) {
                    if (err) {
                        console.error(err);
                        throw err;
                    }
                    //将package转成JSON对象
                    const packageJSON = JSON.parse(data);
                    //设置package.json
                    const npmName = `@share-material/${underline(body.blockName)}`;
                    packageJSON.name = npmName;
                    packageJSON.author = body.author;
                    packageJSON.description = body.description;
                    packageJSON.repository = repository;
                    packageJSON.blockConfig.name = body.blockName;
                    packageJSON.blockConfig.title = body.title;
                    packageJSON.blockConfig.categorie = body.categorieList;
                    packageJSON.blockConfig.tag = body.tagList;
                    packageJSON.blockConfig.businessLines = body.businessLines;
                    // const packageString = JSON.stringify(packageJSON);
                    const packageString = formatJson(packageJSON);
                    //写入package.json
                    fs.writeFile(currPackageUrl, packageString, 'utf8', function (errWrite) {
                        if (errWrite) {
                            console.error(errWrite);
                            throw errWrite;
                        }
                        vscode.window.showInformationMessage(`${body.blockName}区块创建成功！,请在项目下执行yarn 或者 npm install 安装依赖进行开发！`);
                        //关闭
                        global.panel.dispose();
                    })
                })
            }

            terminalA.dispose();

        } catch (error) {
            terminalA.dispose();
        }

    },
    openDebug(body, global){
        global.terminalA = vscode.window.createTerminal({ name: "远程调试" });
        global.terminalA.show(true);
        let str = 'spy-debugger';
        //生成证书
        if(body.https){
            str = 'spy-debugger initCA'
        }
        
        if (!shell.which(str)) {
            vscode.window.showInformationMessage('第一次运行需要安装依赖,成功后浏览器将自动打开调试页面，请稍后...')
            global.terminalA.sendText('npm install spy-debugger -g');
        }else{
            vscode.window.showInformationMessage('插件启动中，成功后浏览器将自动打开调试页面，请稍后...')
        }
        global.terminalA.sendText(str); //执行命令
    },
    closeDebug(body, global){
        global.terminalA.dispose(); //执行命令
    },
    getPreviewWebViewContent(homePage, categorie) {
        const isMobile = categorie === '移动端';
        let iframeSrc = homePage;
        if (isMobile) {
            iframeSrc = `http://192.168.0.62:6002/preview/index.html?name=${encodeURIComponent(homePage)}`
        }
        return `
        <!DOCTYPE html >
            <html lang="en">
            <head>
                <meta charset="UTF-8">
                <meta name="viewport" content="width=device-width, initial-scale=1.0">
                <title>区块预览</title>
                <style>
                    html,body,iframe{
                        height:100% !important;
                        width:100% !important;
                        border: none;
                        overflow: hidden;
                    }
                </style>
            </head>
            <body>
                <iframe id="iframe-preview" src="${iframeSrc}" />
            </body>
        </html>
        `
    },
    getShareUiPreviewWebViewContent(url) {
        let iframeSrc = url;
        return `
        <!DOCTYPE html >
            <html lang="en">
            <head>
                <meta charset="UTF-8">
                <meta name="viewport" content="width=device-width, initial-scale=1.0">
                <title>区块预览</title>
                <style>
                    html,body,iframe{
                        height:100% !important;
                        width:100% !important;
                        border: none;
                        overflow: hidden;
                    }
                </style>
            </head>
            <body>
                <iframe id="iframe-preview" src="${iframeSrc}" />
            </body>
        </html>
        `
    },
    /**
     * 获取当前所在工程根目录，有3种使用方法：<br>
     * getProjectPath(uri) uri 表示工程内某个文件的路径<br>
     * getProjectPath(document) document 表示当前被打开的文件document对象<br>
     * getProjectPath() 会自动从 activeTextEditor 拿document对象，如果没有拿到则报错
     * @param {*} document
     */
    getProjectPath(document) {
        if (!document) {
            document = vscode.window.activeTextEditor ? vscode.window.activeTextEditor.document : null;
        }
        if (!document) {
            this.showError('当前激活的编辑器不是文件或者没有文件被打开！');
            return '';
        }
        const currentFile = (document.uri ? document.uri : document).fsPath;
        let projectPath = null;
        let workspaceFolders = vscode.workspace.workspaceFolders.map(item => item.uri.path);
        /* 由于存在Multi-root工作区，暂时没有特别好的判断方法，先这样粗暴判断
        如果发现只有一个根文件夹，读取其子文件夹作为 workspaceFolders */
        if (workspaceFolders.length == 1 && workspaceFolders[0] === vscode.workspace.rootPath) {
            const rootPath = workspaceFolders[0];
            var files = fs.readdirSync(rootPath);
            workspaceFolders = files.filter(name => !/^\./g.test(name)).map(name => path.resolve(rootPath, name));
        }
        workspaceFolders.forEach(folder => {
            if (currentFile.indexOf(folder) === 0) {
                projectPath = folder;
            }
        });
        if (!projectPath) {
            this.showError('获取工程根路径异常！');
            return '';
        }
        return projectPath;
    },
    /**
     * 获取当前工程名
     */
    getProjectName: function (projectPath) {
        return path.basename(projectPath);
    },
    getPluginPath() {
    },
    /**
     * 将一个单词首字母大写并返回
     * @param {*} word 某个字符串
     */
    upperFirstLetter: function (word) {
        return (word || '').replace(/^\w/, m => m.toUpperCase());
    },
    /**
     * 将一个单词首字母转小写并返回
     * @param {*} word 某个字符串
     */
    lowerFirstLeter: function (word) {
        return (word || '').replace(/^\w/, m => m.toLowerCase());
    },
    /**
     * 全局日志开关，发布时可以注释掉日志输出
     */
    log: function (...args) {
        console.log(...args);
    },
    /**
     * 全局日志开关，发布时可以注释掉日志输出
     */
    error: function (...args) {
        console.error(...args);
    },
    /**
     * 弹出错误信息
     */
    showError: function (info) {
        vscode.window.showErrorMessage(info);
    },
    /**
     * 弹出提示信息
     */
    showInfo: function (info) {
        vscode.window.showInformationMessage(info);
    },
    findStrInFolder: function (folderPath, str) {
    },
    /**
     * 从某个文件里面查找某个字符串，返回第一个匹配处的行与列，未找到返回第一行第一列
     * @param filePath 要查找的文件
     * @param reg 正则对象，最好不要带g，也可以是字符串
     */
    findStrInFile: function (filePath, reg) {
        const content = fs.readFileSync(filePath, 'utf-8');
        reg = typeof reg === 'string' ? new RegExp(reg, 'm') : reg;
        /* 没找到直接返回 */
        if (content.search(reg) < 0)
            return { row: 0, col: 0 };
        const rows = content.split(os.EOL);
        /* 分行查找只为了拿到行 */
        for (let i = 0; i < rows.length; i++) {
            let col = rows[i].search(reg);
            if (col >= 0) {
                return { row: i, col };
            }
        }
        return { row: 0, col: 0 };
    },
    /**
     * 获取某个字符串在文件里第一次出现位置的范围，
     */
    getStrRangeInFile: function (filePath, str) {
        var pos = this.findStrInFile(filePath, str);
        return new vscode.Range(new vscode.Position(pos.row, pos.col), new vscode.Position(pos.row, pos.col + str.length));
    },
    /**
     * 简单的检测版本大小
     */
    checkVersion: function (version1, version2) {
        version1 = parseInt(version1.replace(/\./g, ''));
        version2 = parseInt(version2.replace(/\./g, ''));
        return version1 > version2;
    },
    /**
     * 获取某个扩展文件绝对路径
     * @param context 上下文
     * @param relativePath 扩展中某个文件相对于根目录的路径，如 images/test.jpg
     */
    getExtensionFileAbsolutePath: function (context, relativePath) {
        return path.join(context.extensionPath, relativePath);
    },
    /**
     * 获取某个扩展文件相对于webview需要的一种特殊路径格式
     * 形如：vscode-resource:/Users/toonces/projects/vscode-cat-coding/media/cat.gif
     * @param context 上下文
     * @param relativePath 扩展中某个文件相对于根目录的路径，如 images/test.jpg
     */
    getExtensionFileVscodeResource: function (context, relativePath) {
        const diskPath = vscode.Uri.file(path.join(context.extensionPath, relativePath));
        return diskPath.with({ scheme: 'vscode-resource' }).toString();
    },
    /**
     * 在Finder中打开某个文件或者路径
     */
    openFileInFinder: function (filePath) {
        if (!fs.existsSync(filePath)) {
            this.showError('文件不存在：' + filePath);
        }
        /* 如果是目录，直接打开就好 */
        if (fs.statSync(filePath).isDirectory()) {
            exec(`open ${filePath}`);
        }
        else {
            /* 如果是文件，要分开处理 */
            const fileName = path.basename(filePath);
            filePath = path.dirname(filePath);
            exec(`open ${filePath}`);
        }
    },
    /**
     * 在vscode中打开某个文件
     * @param {*} path 文件绝对路径
     * @param {*} text 可选，如果不为空，则选中第一处匹配的对应文字
     */
    openFileInVscode: function (path, text) {
        let options = undefined;
        if (text) {
            const selection = this.getStrRangeInFile(path, text);
            options = { selection };
        }
        vscode.window.showTextDocument(vscode.Uri.file(path), options);
    },
    /**
     * 用JD-GUI打开jar包
     */
    openJarByJdGui: function (jarPath) {
        // 如何选中文件有待完善
        const jdGuiPath = vscode.workspace.getConfiguration().get('eggHelper.jdGuiPath');
        if (!jdGuiPath) {
            this.showError('JD-GUI路径不能为空！');
            return;
        }
        if (!fs.existsSync(jdGuiPath)) {
            this.showError('您还没有安装JD-GUI，请安装完后到vscode设置里面找到HSF助手并进行路径配置。');
            return;
        }
        if (!fs.existsSync(jarPath)) {
            this.showError('jar包未找到：' + jarPath);
            return;
        }
        exec(`open ${jarPath} -a ${jdGuiPath}`);
    },
    /**
     * 使用默认浏览器中打开某个URL
     */
    openUrlInBrowser: function (url) {
        exec(`open '${url}'`);
    },
    /**
     * 递归遍历清空某个资源的require缓存
     * @param {*} absolutePath
     */
    clearRequireCache(absolutePath) {
        const root = require.cache[absolutePath];
        if (!root)
            return;
        if (root.children) {
            /* 如果有子依赖项，先清空依赖项的缓存 */
            root.children.forEach(item => {
                this.clearRequireCache(item.id);
            });
        }
        delete require.cache[absolutePath];
    },
    /**
     * 动态require，和普通require不同的是，加载之前会先尝试删除缓存
     * @param {*} modulePath
     */
    dynamicRequire(modulePath) {
        this.clearRequireCache(modulePath);
        return require(modulePath);
    },
    /**
     * 读取properties文件
     * @param {*} filePath
     */
    readProperties(filePath) {
        const content = fs.readFileSync(filePath, 'utf-8');
        let rows = content.split(os.EOL);
        rows = rows.filter(row => row && row.trim() && !/^#/.test(row));
        const result = {};
        rows.forEach(row => {
            let temp = row.split('=');
            result[temp[0].trim()] = temp[1].trim();
        });
        return result;
    },
    /**
     * 比较2个对象转JSON字符串后是否完全一样
     * 特别注意，由于JS遍历对象的无序性（部分浏览器是按照添加顺序遍历的）导致同样的对象，
     * 转成JSON串之后反而不一样，所以这里采用其它方式实现。
     * @param {*} obj1
     * @param {*} obj2
     */
    jsonEquals(obj1, obj2) {
        let s1 = this.formatToSpecialJSON(obj1, '', true);
        let s2 = this.formatToSpecialJSON(obj2, '', true);
        return s1 === s2;
    },
    getWebViewContent(context, templatePath) {
        const resourcePath = this.getExtensionFileAbsolutePath(context, templatePath);
        const dirPath = path.dirname(resourcePath);
        let html = fs.readFileSync(resourcePath, 'utf-8');
        html = html.replace(/(<link.+?href="|<script.+?src=")(.+?)"/g, (m, $1, $2) => {
            return $1 + vscode.Uri.file(path.resolve(dirPath, $2)).with({
                scheme: 'vscode-resource'
            }).toString() + '"';
        });
        return html;
    }

};

module.exports = util;