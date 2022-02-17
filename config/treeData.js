const commonTreeData = {
  'blockDevelop':{
    name:'区块开发',
    command:'share.openAddBlockWebview'
  },
  'useMaterial': {
    name:'物料库区块使用',
    command:'share.openUseBlockWebview'
  },
  'remoteDebuggerPhone': {
    name:'本机远程调试手机页面',
    command:'share.debugg-mobile'
  },
}

const amoyTreeData = {
  'AmoyGlobalSetting': {
    name:'Amoy全局配置',
    command:'22'
  },
  'createFront':{
    name:'新建代码工程',
    command:'22'
  },
  'createFrontFromAmoy':{
    name:'从Amoy选择创建',
    command:'22'
  }
}

module.exports = {
  commonTreeData,
  amoyTreeData
}
