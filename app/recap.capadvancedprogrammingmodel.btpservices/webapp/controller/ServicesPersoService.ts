Promise.prototype.done = function (onFulfilled, onRejected) {
    let failFn = (fn) => { this.failFn = fn };
    this.then(onFulfilled, onRejected)
        .catch((e) => {
            // setTimeout(function() { throw e; });
            this.failFn(e);
        });
    return { fail: failFn }
};
Promise.prototype.fail = function (onFail) {
    this.catch((e) => onFail(e));
};
export default {
    getPersData: function () {
        return new Promise((resolve) => {
            if (!this._oBundle) {
                this._oBundle = this.oData;
            }
            resolve(this._oBundle);
        });
    },

    setPersData: function (oBundle) {
        return new Promise((resolve) => {
            this._oBundle = oBundle;
            resolve();
        });
    },


    delPersData: function () {
        return new Promise((resolve) => {
            resolve();
        });
    }
};
