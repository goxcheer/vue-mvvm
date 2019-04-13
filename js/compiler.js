/**
 *@Author: Goxcheer
 *@Date:16:10 2019/4/11
 *@Email:604721660@qq.com
 *@decription: 解析器
 */
/**
 * 解析器构造
 * @param el  //根节点元素
 * @param vm  //vue实例对象
 * @constructor
 */
function Compiler(el, vm){ //#app, miniVue
    this.vm = vm;
    this.el = document.querySelector(el); //获取#app匹配的静态dom元素
    this.fragment = null;
    this.init();
}

Compiler.prototype = {
    init: function(){
        if (this.el) {
            this.fragment = this.nodeToFragment(this.el);  //获取文档片段
            this.compileElement(this.fragment); //解析文档片段
            this.el.appendChild(this.fragment);
        }
    },
    /**
     * 根据dom节点获取文档片段
    * @param el
     * @returns {DocumentFragment}
     */
    nodeToFragment: function(el) {
        var fragment = document.createDocumentFragment();
        var child = el.firstChild;
        while (child) {
            // 将Dom元素移入fragment中
            fragment.appendChild(child);
            child = el.firstChild
        }
        return fragment;
    },
    compileElement: function(fragment) {
        let childNodes = fragment.childNodes;
        let t = this;
        [].slice.call(childNodes).forEach(node => {
            let reg = /\{\{(.*)\}\}/;  //匹配{{}}的表达式
            let text = node.textContent;

            if (t.isElementNode(node)){
                t.compile(node); //元素节点解析是否含有指令
            } else if (t.isTextNode(node) && reg.test(text)){
                t.compileText(node, reg.exec(text)[1]); //文本节点匹配{{}},解析
            }
            if (node.childNodes && node.childNodes.length) {
                t.compileElement(node);  //递归解析fragment
            }
        })
    },
    /**
     * 解析是否含有指令 ,事件或者v-model
     * @param node
     */
    compile: function(node){
        let nodeAttrs = node.attributes; //节点元素的所有属性
        let t = this;
         Array.prototype.forEach.call(nodeAttrs, attr =>{
             let attrName = attr.name;
             if (t.isDirective(attrName)){  //指令属性
                 let dir = attrName.substring(2);
                 let exp = attr.value;
                 if (t.isEventDirective(dir)){
                     t.compileEvent(node, t.vm, exp, dir);  //Event指令解析
                 } else {
                     t.compileModel(node, t.vm, exp, dir); //v-model指令解析
                 }
                 node.removeAttribute(attrName);
             }
         })
    },
    /**
     * 解析是否匹配{{}}表达式
     * @param node
     * @param exp
     */
    compileText: function(node, exp){
        let t = this;
        let initText = t.vm[exp];
        t.updateText(node, initText);
        new Watcher(this.vm, exp, function (value) {
            t.updateText(node, value);
        });
    },
    /**
     * Event指令解析
     * @param node
     * @param vm
     * @param exp
     * @param dir
     */
    compileEvent: function(node, vm, exp, dir) {
        let eventType = dir.split(':')[1];
        let cb = vm.methods && vm.methods[exp];

        if (eventType && cb) {
            node.addEventListener(eventType, cb.bind(vm), false);  //绑定事件和方法都存在则添加事件Listener
        }
    },
    /**
     * v-model指令解析
     * @param node
     * @param vm
     * @param exp
     * @param dir
     */
    compileModel: function(node, vm, exp, dir) {
        let t = this;
        let val = t.vm[exp];
        t.modelUpdater(node, val);
        new Watcher(t.vm, exp, function (value) {  //新的Watcher实例
            t.modelUpdater(node, value);
        });
        node.addEventListener('input', function(e) {
            var newValue = e.target.value;
            if (val === newValue) {
                return;
            }
            t.vm[exp] = newValue;
            val = newValue;
        });
   },
    /**
     * v-model
     * @param attr
     * @returns {boolean}
     */
    isDirective: function(attr){
        return attr.indexOf('v-') == 0;
    },
    /**
     * 事件指令
     * @param dir
     * @returns {boolean}
     */
    isEventDirective: function(dir) {
        return dir.indexOf('on:') === 0;
    },
    /*
    是否是元素节点
     */
    isElementNode:  function(node){
        return node.nodeType == 1;
    },
    /*
    是否文本节点
     */
    isTextNode: function(node){
        return node.nodeType == 3;
    },
    /**
     * data值改变时更新元素视图的vaule
     * @param node
     * @param value
     * @param oldValue
     */
    modelUpdater: function(node, value, oldValue){
        node.value = typeof value == 'undefined' ? '' : value;
    },
    /**
     * 更新{{}}绑定的值
     * @param node
     * @param value
     */
    updateText: function (node, value) {
        node.textContent = typeof value == 'undefined' ? '' : value;
    }
}