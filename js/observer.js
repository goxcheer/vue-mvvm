/**
 *@Author: Goxcheer
 *@Date:15:29 2019/4/11
 *@Email:604721660@qq.com
 *@decription: 观察者Observer
 */
/**
 * 观察者构造
 * @param data
 * @constructor
 */
function Observer(data){
    this.data = data;
    this.init(data);
}

Observer.prototype = {
    init: function(data){
        let t = this;
        Object.keys(data).forEach(key => {
            t.defineReactive(data, key, data[key]);
        })
    },
    defineReactive: function(data, key, val){
        let subscriber = new Subscriber();
        observe(val); //递归调用observe，属性的值
        Object.defineProperty(data, key, {
            enumerable: true,
            configurable: true,
            get: function(){
                if (Subscriber.target) {  //观察者目标对象
                    subscriber.addSub(Subscriber.target);
                }
                return val;
            },
            set: function(newVal){
                if (newVal === val) {
                    return;
                }
                val = newVal;
                subscriber.notify();
            }
        })
    }
}

/**
 * 观察器
 * @param value
 * @returns {Observer}
 */
function observe (value){
    if (!value || typeof value !== 'object') {
        return;
    }
    return new Observer(value);
}

/**
 * 订阅器
 * @constructor
 */
function Subscriber (){
    this.subs = []; //订阅者集合，实际存放的是监听器Watcher实例
}

Subscriber.prototype = {
    addSub: function(sub){   //添加订阅者
        this.subs.push(sub);
    },
    notify: function(){
        this.subs.forEach(sub => {
            sub.update();  //通知所有订阅者
        })
    }
}
Subscriber.target = null;