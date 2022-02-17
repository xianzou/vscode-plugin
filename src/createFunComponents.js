const vscode = require('vscode');
const path = require('path');
const fs = require('fs');
const util = require("./util");

const generateComponent = (componentName,fullPath) =>{
    console.log(componentName,fullPath);
    if(!(/^[A-Z][A-z0-9]*$/).test(componentName)){
        util.showInfo(`组件名称使用首字母大写驼峰命名！`);   
        return false;
    }
    //判断要创建的文件是否存在
    if (fs.existsSync(fullPath)) {
        util.showInfo(`${componentName}已经存在！`);
        return false;
    }
    fs.mkdir(fullPath,{recursive:true},(err)=>{
        if(err){
            throw err;
        }else{
            var date = new Date();

            //首写小字母
            var toLowerCaseCompNameArr = [...componentName];
            toLowerCaseCompNameArr[0] = toLowerCaseCompNameArr[0].toLowerCase()
            var  toLowerCaseCompName = toLowerCaseCompNameArr.join('');

            fs.writeFile(`${fullPath}/${componentName}.js`,`
/**  版权声明 厦门畅享信息技术有限公司， 版权所有 违者必究
*
*  @Copyright:  Copyright (c) 2020
*  @Company:厦门畅享信息技术有限公司
*  @Author: 李家其
*  Date: ${`${date.getFullYear()}/${date.getMonth()+1}/${new Date().getDate()} ${date.getHours()}:${date.getMinutes()}`}
*/

import styles from './${componentName}.scss';
import React from 'react';

const ${componentName} = () => {

    return (
        <div className={styles.${toLowerCaseCompName}}>
            ${componentName}
        </div>
    );
};

export default ${componentName};
`,'utf8',function(error){
                if(error){
                  console.log(error);
                  return false;
                }
                console.log('写入成功');
            });
            fs.writeFile(`${fullPath}/${componentName}.scss`,`.${toLowerCaseCompName}{

}
            `,'utf8',function(error){
                if(error){
                  console.log(error);
                  return false;
                }
                console.log('写入成功');
            });
            fs.writeFile(`${fullPath}/index.js`,`export { default } from './${componentName}';
`,'utf8',function(error){
                if(error){
                  console.log(error);
                  return false;
                }
                console.log('写入成功');
                util.showInfo(`${componentName}创建成功！`);
            });
        }
    });
}

const createFunComponents = function (){
    const fc = vscode.commands.registerCommand('extension.createFunctionalComponent', function (param) {
        // 文件夹绝对路径
        const folderPath = param.fsPath;
    
        const options = {
            prompt: "请输入组件名: ",
            placeHolder: "组件名"
        }
        // 调出系统输入框获取组件名
        vscode.window.showInputBox(options).then(value => {
            if (!value) return;
    
            const componentName = value;
            const fullPath = `${folderPath}/${componentName}`;
            console.log(componentName,fullPath);
            // 生成模板代码，不是本文的重点，先忽略
            generateComponent(componentName, fullPath);
        });
    });
    return fc;
}

module.exports = {
    createFunComponents
}