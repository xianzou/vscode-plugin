/**  版权声明 厦门畅享信息技术有限公司, 版权所有 违者必究
 *
 *  @Copyright:  Copyright (c) 2020
 *  @Company:厦门畅享信息技术有限公司
 *  @Author: 李家其
 *  Date: 2021/04/01 10:19
 */
 "use strict";
 Object.defineProperty(exports, "__esModule", { value: true });
 const vscode = require('vscode');

const myStatusBarItem = vscode.window.createStatusBarItem(vscode.StatusBarAlignment.Left);

const rules = [{
    'desc':'匹配数字，',
    rule:/\d+，/g,
    key:'，',
    right:','
},
{
    'desc':'匹配英文，',
    rule:/[a-zA-Z]+，/g,
    key:'，',
    right:','
},
{
    'desc':'匹配英文：',
    rule:/[a-zA-Z]+：/g,
    key:'：',
    right:':'
}
,{
    'desc':'匹配时间：',
    rule:/\d+：/g,
    key:'：',
    right:':'
},{
    'desc':'匹配汉字,',
    rule:/[\u4e00-\u9fa5]+,/g,
    key:',',
    right:'，'
},{
    'desc':'匹配汉字:',
    rule:/[\u4e00-\u9fa5]+:/g,
    key:':',
    right:'：'
},{
    'desc':'匹配text，input',
    rule: /<((input|textarea|textArea|Input|TextArea|TextareaItem|InputItem) .*?)>\w*?(<\/\1>)?/g,
    key:'maxLength',
    right:'maxLength'
}]

const  checkBug = (context) => {
    let timeout =  undefined;
    //创建问题诊断集合
    const collection = vscode.languages.createDiagnosticCollection('sneak');
    //获取配置中异常中文标点的样式
    let sneakDecorationType = getSneakDecorationType();
    //编辑中页面
    let activeEditor = vscode.window.activeTextEditor;
    //更新页面标记
    function updateDecorations() {
        //如果没有编辑中页面直接退出
        if (!activeEditor) {
            return;
        }
        //超过2000行不检查
        const lineCount = activeEditor.document.lineCount;
        if(lineCount >= 2000){
            return;
        }
        //获取编辑中页面的文本信息
        const text = activeEditor.document.getText();
        //装饰集（这里就是需要被修改样式的异常中文标点）
        const sneakCharCodes = [];
        //匹配到被''""``包裹的异常字符串的正则对象
        let match = [];
        //异常中文标点诊断信息列表
        const diagnosticList = [];
      
        rules.forEach(row => {
            let matchTarget = [];
            while ((matchTarget = row.rule.exec(text)) != null) {
                match.push({text:matchTarget[0],index:matchTarget.index,key:row.key,right:row.right})
            }

        });
        if(match.length){
            match.forEach(row => {
                const codeIndex = row.text.indexOf(row.key)
                let startIndex = row.index;
                if(codeIndex != -1){
                    startIndex += codeIndex;
                }
                //异常中文标点的开始位置
                const startPos = activeEditor.document.positionAt(startIndex);
                //异常中文标点结束位置，这几个要检测的标点只占一个位置，加1即可
                let endPos = activeEditor.document.positionAt(startIndex + 1);
                let message= '';
                if(row.key === 'maxLength'){
                    endPos = activeEditor.document.positionAt(startIndex + row.text.length);
                    message= `缺少maxLength属性,请排查是否为低级bug\n预期为：${row.right}`; //问题诊断面版展示的说明信息
                }else{
                    message= `疑似异常字符，请排查是否为低级bug\n预期为：${row.right}`;//问题诊断面版展示的说明信息
                }
                //异常中文标点的诊断信息，问题诊断面版要用到
                diagnosticList.push({
                    message,
                    range: new vscode.Range(startPos, endPos), //问题诊断面版展示位置信息，点击可跳转相应位置
                    severity: vscode.DiagnosticSeverity.Warning, //问题类型
                });
               
                //异常中文标点的范围
                const decoration = {
                    range: new vscode.Range(startPos, endPos)
                };
                //对异常中文标点的范围应用设定好的修饰样式
                sneakCharCodes.push(decoration);
            })
        }
        //问题诊断面版添加异常中文标点相关信息
        collection.set(activeEditor.document.uri, diagnosticList);
        //更新状态栏统计异常中文标点个数
        updateStatusBarItem(sneakCharCodes.length);
        //激活中的编辑页面中文异常标点位置添加样式
        activeEditor.setDecorations(sneakDecorationType, sneakCharCodes);
    }
    //状态栏展示异常标点统计
    function updateStatusBarItem(num) {
        if (num < 0) {
            return;
        }
        myStatusBarItem.text = `存在${num}个异常标点`;
        myStatusBarItem.show();
    }
    //获取选项设置里面设置的样式信息，这里暂时只有一个背景颜色。
    function getSneakDecorationType() {
        const markColor = vscode.workspace
            .getConfiguration()
            .get('sneakMark.markColor');
        return vscode.window.createTextEditorDecorationType({
            backgroundColor: markColor
        });
    }
    //判断是否存在中文标点
    function isChineseMark(str) {
        //此处正则匹配注意与之前的匹配不同，不能加g。
        const charCodeRegEx = /(，|。|‘|’|“|”|？|！)/;
        return charCodeRegEx.test(str);
    }
    //判断是否存在中文
    function isChineseChar(str) {
        var reg = /[\u4E00-\u9FA5\uF900-\uFA2D]/;
        return reg.test(str);
    }
     //触发页面中中文异常标点位置的样式更新
     function triggerUpdateDecorations() {
        if (timeout) {
            clearTimeout(timeout);
            timeout = undefined;
        }
        timeout = setTimeout(updateDecorations, 500);
    }
    //启动时存在打开的编辑页面触发一次样式更新
    if (activeEditor) {
        triggerUpdateDecorations();
    }
    //切换编辑页面事件，会触发样式更新
    vscode.window.onDidChangeActiveTextEditor(
        editor => {
            activeEditor = editor;
            if (editor) {
                triggerUpdateDecorations();
            }
        },
        null,
        context.subscriptions
    );
    //编辑页面中的内容变化，会触发样式更新
    vscode.workspace.onDidChangeTextDocument(
        event => {
            if (activeEditor && event.document === activeEditor.document) {
                triggerUpdateDecorations();
            }
        },
        null,
        context.subscriptions
    );
    //更改选项中的设置会重新获取样式信息
    vscode.workspace.onDidChangeConfiguration(() => {
        sneakDecorationType = getSneakDecorationType();
    });
}
//  module.exports = checkBug;
 exports.checkBug=checkBug;