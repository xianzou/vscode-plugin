const callbacks = {}; // 存放所有的回调函数
const vscode = acquireVsCodeApi();
/**
 * 调用vscode原生api
 * @param data 可以是类似 {cmd: 'xxx', param1: 'xxx'}，也可以直接是 cmd 字符串
 * @param cb 可选的回调函数
 */
function callVscode(data, cb) {
    if (typeof data === 'string') {
        data = { cmd: data };
    }
    if (cb) {
        // 时间戳加上5位随机数
        const cbid = Date.now() + '' + Math.round(Math.random() * 100000);
        // 将回调函数分配一个随机cbid然后存起来，后续需要执行的时候再捞起来
        callbacks[cbid] = cb;
        data.cbid = cbid;
    }
    vscode.postMessage(data);
}
window.addEventListener('message', event => {
    const message = event.data;
    switch (message.cmd) {
        // 来自vscode的回调
        case 'vscodeCallback':
            (callbacks[message.cbid] || function () { })(message.data);
            delete callbacks[message.cbid]; // 执行完回调删除
            break;
        default: break;
    }
});