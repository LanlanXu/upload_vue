<!-- @format -->

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
<style lang="less">
@import url('./assets/styles/base.less');
html,
body {
  height: 100%;
  width: 100%;
  overflow-x: hidden;
}
.auth-error {
  .fz(24);
}
</style>
