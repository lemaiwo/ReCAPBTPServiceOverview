"use strict";sap.ui.define([],function(){Promise.prototype.done=function(t,e){let n=t=>{this.failFn=t};this.then(t,e).catch(t=>{this.failFn(t)});return{fail:n}};Promise.prototype.fail=function(t){this.catch(e=>t(e))};var t={getPersData:function(){return new Promise(t=>{if(!this._oBundle){this._oBundle=this.oData}t(this._oBundle)})},setPersData:function(t){return new Promise(e=>{this._oBundle=t;e()})},delPersData:function(){return new Promise(t=>{t()})}};return t});
//# sourceMappingURL=ServicesPersoService.js.map