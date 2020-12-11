# 上传组件vue版本，兼容ie9

## 主要文件如下：
├─build  
│  │  webpack.dev.server.js  // 模拟的后端接口  
│  │    
│  └─upload_images // 上传图片存入的文件夹  
│        
└─src  
    │  App.vue // 引入组件  
    │  index.js  
    │            
    ├─components  
    │  └─VUploader // 上传组件  
    │          delete.png  
    │          index.css  
    │          index.less  
    │          index.vue  
    │          upload.png  

### 如何引入组件，参数与 [前后端不分离的组件](https://github.com/LanlanXu/upload_backend/edit/main/README.md)类似
``` javascript
<template>
  <div id="app">
    <VUpload :options="params" ref="vUpload" />
  </div>
</template>

<script>
import VUpload from '@/components/VUploader/index.vue';
export default {
  components: { VUpload },
  // 监听,当路由发生变化的时候执行
  data() {
    var _this = this;
    return {
      params: {
        server: (() => {
          return '/upload.do?action=uploadFile';
        })(),
        canDelete: true,
        // allowNum: 2,
        fileSingleSizeLimit: 20971520, // 允许上传的单个文件的大小，单位：字节【非必需：默认无大小限制】
        accept: {
          // 允许上传的类型【非必需：默认无类型限制】
          extensions: 'txt,jpg,jpeg,png,doc,docx,pptx,xls,xlsx,pdf,rar,zip' // 检测类型
        },
        /**
         * 成功的条件【必需】
         * @param {接口返回对象} response
         */
        successOption(response) {
          return !!response;
        },
        /**
         * 成功的回调函数【非必需】
         * @param {接口返回对象} response
         */
        uploadCallback(response) {
          console.log(response);
        },
        /**
         * 失败的回调函数【非必需】
         * @param {接口返回对象} response
         */
        errorCallback(response) {
          console.log(response);
        },
        /**
         * 删除的回调函数【非必需：默认直接移除展示文件】
         * @param {附件id} id
         */
        deleteCallback(id) {
          setTimeout(() => {
            // 必需要：要执行页面展示文件删除
            _this.$refs.vUpload.deleteListItem(id);
          }, 1000);
        }
      }
    };
  },
  mounted() {}
};
</script>
```
