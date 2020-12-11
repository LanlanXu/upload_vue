<!-- @format -->
<!--
** iframe + form 一组为上传；
** 每次选择一个上传的时候，马上看有没有可操作组（无的话，重新建一组）；
** 上传完成后将该组初试为可操作组；
-->
<template>
  <div class="iu-module">
    <div class="iu-btns">
      <div
        id="picker"
        class="iu-choose-btn"
        :class="{ disabled: disabled }"
        :title="title"
      >
        <label>选择文件</label>
        <div
          class="iu-wrap"
          :class="{ top: item.top }"
          :wrap-id="item.id"
          v-for="item in iframes"
          :key="item.id"
        >
          <iframe :name="item.id" :id="item.id" @load="upComplete"></iframe>
          <form
            :action="options.server"
            method="post"
            enctype="multipart/form-data"
            name="fileForm"
            :target="item.id"
          >
            <input
              type="file"
              class="iu-file"
              name="file"
              :data-id="item.id"
              @change="changeEvt"
              :accept="options.mimeTypes ? options.mimeTypes : '*'"
              v-if="item.inputShow"
            />
          </form>
        </div>
      </div>
      <i class="iu-remark"
        >支持文件格式：xxxx\xxxxx\xxx，单个文件大小不超过xxxxkb。</i
      >
    </div>
    <!--用来存放文件信息-->
    <ul id="iu-list" class="iu-list">
      <li :id="'file-' + file.id" v-for="file in fileList" :key="file.id">
        <h3 :title="file.name" :class="{ 'wid-80': options.canDelete }">
          {{ file.name }}
        </h3>
        <div class="iu-des">
          <span class="iu-size">{{ _bytesToSize(file.size) }}</span
          ><span :class="'iu-status iu-' + file.status">{{
            status[file.status]
          }}</span>
        </div>
        <span
          class="iu-delete"
          :data-id="file.id"
          v-show="file.showDelete"
          @click="deleteItem(file.id)"
        ></span>
      </li>
    </ul>
  </div>
</template>

<script>
export default {
  name: 'v-uploader',
  props: {
    options: Object
  },
  data() {
    return {
      isIE9: false, // 是否是ie9
      iframes: [], // 上传组数组
      fileList: [], // 展示数组
      status: {
        // 状态对应的文字
        uploading: '正在上传',
        finish: '上传完成',
        fail: '上传失败'
      },
      disabled: false, // 禁止上传
      title: '' // 禁止上传的提示语
    };
  },
  mounted() {
    // console.log(this.options.server, 2342);
    // for (let key in this.options) {
    //   this[key] = this.options[key];
    // }
    this.initUploadModule();
    // 判断是否是ie9
    this.$nextTick(() => {
      this.isIE9 = !document.querySelector('.iu-file').files;
    });
  },
  methods: {
    /**
     * 创建上传组
     */
    initUploadModule() {
      if (!this.iframes.filter(item => item.top).length)
        this.iframes.push({
          id: this._getUniqueCode(),
          top: true,
          inputShow: true
        });
    },
    /**
     * change事件
     * @param {事件对象} e
     */
    changeEvt(e) {
      // 防止清除value时触发事件
      if (!this.isIE9) {
        if (!e.target.files.length) return;
      } else {
        if (!e.target.value) return;
      }

      var fileObj = this._getFile(e.target),
        inputId = e.target.getAttribute('data-id');

      if (!this.beforeUpload(fileObj)) {
        this.deleteInputVal(e.target, inputId);
        return false;
      }
      var curForm = e.target.parentElement,
        wrap = e.target.parentElement.parentElement,
        wrapId = wrap.getAttribute('wrap-id'),
        fileId = this._getUniqueCode();

      fileObj.id = e.target.id = fileId;
      fileObj.showDelete = false;
      fileObj.status = 'uploading';
      // wrap.setAttribute('list-id', fileId);

      this.fileList.push(fileObj);
      curForm.submit();

      this.iframes.forEach(item => {
        if (item.id === wrapId) {
          item.top = false;
        }
      });

      this._checkNum(); // 检查上传了多少文件，是否禁用上传

      this.initUploadModule(); // 生成备用上传组
    },
    /**
     * 主要是添加上传的一些限制
     * can do something......：可以修改提示语，及将alert更换为项目中的提示方法
     * @param {文件对象} file
     * @return bool 条件是否正确
     */
    beforeUpload(file) {
      var types = this.options.accept
        ? this.options.accept.extensions.split(',')
        : [];

      if (types.length && !types.includes(file.ext.toLowerCase())) {
        alert('请上传符合要求的文件格式');
        return false;
      }
      // 非ie9的时候，前端可做大小限制；ie9中只能后台做限制
      if (!this.isIE9) {
        if (file.size === 0) {
          alert('不得上传空文件');
          return false;
        }
        if (
          this.options.fileSingleSizeLimit &&
          file.size > this.options.fileSingleSizeLimit
        ) {
          alert(
            `上传文件大小不能超过${this._bytesToSize(
              this.options.fileSingleSizeLimit
            )}!`
          );
          return false;
        }
      }

      return true;
    },
    /**
     * 上传文件个数限制
     */
    _checkNum() {
      var allowNum = this.options.allowNum ? this.options.allowNum : 0;
      if (!allowNum) return;

      if (allowNum && this.fileList.length >= allowNum) {
        this.disabled = true;
        this.title = '当前只支持上传' + allowNum + '个文件';
      } else {
        this.disabled = false;
        this.title = '';
      }
    },
    /**
     * 上传完成
     * @param {事件对象} e
     */
    upComplete(e) {
      var iframeName = e.target.getAttribute('name'),
        doc =
          document.getElementById(iframeName).contentDocument ||
          document.frames[iframeName].document,
        res = doc.body.innerHTML;

      if (!res) return;

      var input = document.querySelector("[data-id='" + iframeName + "']"),
        fileObj = this._getFile(input);

      this.iframes.forEach(item => {
        if (item.id === iframeName) {
          item.top = true;
        }
      });

      try {
        this.upSuccess(fileObj, JSON.parse(res.replace(/<\/?pre[^>]*>/g, '')));
      } catch (error) {
        this.upError(fileObj, res);
      }

      this.deleteInputVal(input, iframeName);
    },
    /**
     * 上传成功回调函数
     * can do something......：可以加一下其他操作
     * @param {文件对象} file
     * @param {接口返回对象} response
     */
    upSuccess(file, response) {
      var $li = document.getElementById('file-' + file.id),
        canDelete = this.options.canDelete;

      if (this.options.successOption(response)) {
        this.fileList.forEach(item => {
          if (item.id === file.id) {
            // ie9 后显示文件大小
            if (this.isIE9) item.size = response.size;
            // 改变状态
            item.status = 'finish';
            // 是否显示删除按钮
            if (canDelete) item.showDelete = true;
            // 替换新的id
            item.id = response.id;
          }
        });
      } else {
        this._removeListItem(file);
      }
      if (this.options.uploadCallback) this.options.uploadCallback(response);
    },
    /**
     * 上传失败回调函数
     * @param {文件对象} file
     * @param {失败信息} response
     */
    upError(file, response) {
      this._removeListItem(file);
      // can do something......
      if (this.options.errorCallback) this.options.errorCallback(response);
    },
    /**
     * 清除input中的值
     * @param {input对象} obj
     * @param {上传组id} id
     */
    deleteInputVal(obj, id) {
      obj.value = '';
      // ie9 下input值清空的兼容性写法
      if (this.isIE9) {
        // 此处的inputShow的值从false变成true，是为了让它移除后再添加，不然内部的值清除不了
        this.iframes.forEach(item => {
          if (item.id === id) {
            item.inputShow = false;
          }
        });
        this.$nextTick(() => {
          this.iframes.forEach(item => {
            if (item.id === id) {
              item.inputShow = true;
            }
          });
        });
      }
    },
    deleteItem(id) {
      if (this.options.deleteCallback) {
        this.options.deleteCallback(id);
      } else {
        this.deleteListItem(id);
      }
    },
    /**
     * 删除展示的文件
     * @param {展示文件id} id
     */
    deleteListItem(id) {
      this.fileList.forEach((item, index) => {
        if (item.id === id) {
          this.fileList.splice(index, 1);
        }
      });
      this._checkNum();
    },
    /**
     * 上传失败后自动移除
     * @param {文件对象} file
     */
    _removeListItem(file) {
      var $li = document.getElementById('file-' + file.id);

      this.fileList.forEach(item => {
        if (item.id === file.id) {
          item.status = 'fail';
        }
      });

      setTimeout(function() {
        $li && ($li.remove ? $li.remove() : $li.removeNode());
      }, 1000);
    },
    /**
     * 获取文件对象：兼容ie9
     * @param {DOM对象} ele
     * @return 文件对象
     */
    _getFile(ele) {
      var fileObj;

      if (!this.isIE9) {
        fileObj = ele.files[0];
      } else {
        fileObj = {};
        fileObj.size = null;
        fileObj.name = ele.value.split('\\').pop();
        ele.id && (fileObj.id = ele.id);
      }
      fileObj.ext = fileObj.name.split('.').pop();

      return fileObj;
    },
    /**
     * 获取唯一码
     * @return 唯一编码
     */
    _getUniqueCode() {
      return Math.random()
        .toString(32)
        .substring(2);
    },
    /**
     * 文件大小转化
     * @param {字节数} bytes
     * @return 文件大小展示
     */
    _bytesToSize(bytes) {
      if (bytes === null) return '';
      if (bytes === 0) return '0B';

      var k = 1024,
        sizes = ['B', 'KB', 'MB', 'GB', 'TB', 'PB', 'EB', 'ZB', 'YB'],
        i = Math.floor(Math.log(bytes) / Math.log(k));

      return (bytes / Math.pow(k, i)).toPrecision(3) + sizes[i];
    }
  }
};
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped lang="less">
@import url('./index.less');
</style>
