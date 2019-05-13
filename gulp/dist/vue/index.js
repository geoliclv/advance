var __vueify_insert__ = require("vueify/lib/insert-css")
var __vueify_style__ = __vueify_insert__.insert("/* line 3, stdin */\n.title[_v-9ada8cfa] {\n  color: red; }\n")
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = {
  data: function data() {
    return {
      title: "compiered by gulp"
    };
  }
};
if (module.exports.__esModule) module.exports = module.exports.default
;(typeof module.exports === "function"? module.exports.options: module.exports).template = "\n<div _v-9ada8cfa=\"\">\n  <div _v-9ada8cfa=\"\">this is a vue text</div>\n  <div class=\"title\" _v-9ada8cfa=\"\">{{title}}</div>\n</div>\n"
if (module.hot) {(function () {  module.hot.accept()
  var hotAPI = require("vue-hot-reload-api")
  hotAPI.install(require("vue"), true)
  if (!hotAPI.compatible) return
  module.hot.dispose(function () {
    __vueify_insert__.cache["/* line 3, stdin */\n.title[_v-9ada8cfa] {\n  color: red; }\n"] = false
    document.head.removeChild(__vueify_style__)
  })
  if (!module.hot.data) {
    hotAPI.createRecord("_v-9ada8cfa", module.exports)
  } else {
    hotAPI.update("_v-9ada8cfa", module.exports, (typeof module.exports === "function" ? module.exports.options : module.exports).template)
  }
})()}