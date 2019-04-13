/**
 *@Author: Goxcheer
 *@Date:18:04 2019/4/11
 *@Email:604721660@qq.com
 *@decription: 监听器
 */

/**
 * Watcher构造器
 * @param vm
 * @param exp
 * @param cb
 * @constructor
 */
function Watcher(vm, exp, cb){
    this.vm = vm;
    this.exp = exp;
    this.cb = cb;
    this.value = this.get();
}

Watcher.prototype = {
    update: function() {
        let value = this.vm.data[this.exp];
        let oldValue = this.value;
        if (value !== oldValue) {
            this.value = value;
            this.cb.call(this.vm, value, oldValue);
        }
    },
    get: function(){
        Subscriber.target = this; //缓存自己
        let value = this.vm.data[this.exp];
        Subscriber.target = null; //释放自己
        return value;
    }

}