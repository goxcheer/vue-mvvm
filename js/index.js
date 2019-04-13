/**
 *@Author: Goxcheer
 *@Date:15:08 2019/4/11
 *@Email:604721660@qq.com
 *@decription: mini版的Vue
 */
/**
 * miniVue构造
 * @param attributes
 */
function miniVue (attributes){
    let t = this;
    t.data = attributes.data;
    t.methods = attributes.methods;

    Object.keys(t.data).forEach(key => {
        t.proxyKeys(key);
    })

    observe(t.data);
    new Compiler(attributes.el, this);
    attributes.mounted.call(this);
}

miniVue.prototype = {
    proxyKeys: function(key){   //属性设置代理，绑定get，set来与绑定消息订阅器Dep的Observer关联
        let t = this;
        Object.defineProperty(this, key, {
            enumerable: false,
            configurable: true,
            get: function(){
                return t.data[key];
            },
            set: function(newVal){
                t.data[key] = newVal;
            }
        })
    }
}