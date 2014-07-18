!function(e){if("object"==typeof exports)module.exports=e();else if("function"==typeof define&&define.amd)define(e);else{var t;"undefined"!=typeof window?t=window:"undefined"!=typeof global?t=global:"undefined"!=typeof self&&(t=self),(t.skynetPlugins||(t.skynetPlugins={})).skynetMobilePluginHeartbeat=e()}}(function(){return function e(t,r,n){function i(s,a){if(!r[s]){if(!t[s]){var u="function"==typeof require&&require;if(!a&&u)return u(s,!0);if(o)return o(s,!0);throw new Error("Cannot find module '"+s+"'")}var c=r[s]={exports:{}};t[s][0].call(c.exports,function(e){var r=t[s][1][e];return i(r?r:e)},c,c.exports,e,t,r,n)}return r[s].exports}for(var o="function"==typeof require&&require,s=0;s<n.length;s++)i(n[s]);return i}({1:[function(e,t){(function(){function r(e,t,r,n){var o=this;o.name=n,o.messenger=e,o.options=t,o.api=r;var s=function(e,t){var r={type:o.name};e&&(r.error=e),t&&(r.html=t),o.api.logActivity(r)};return t.addressKey||(t.addressKey="heart_"+n),i.config(t,{logIt:s}),i.init(),$(document).on("heart-rate",function(e,t){o.messenger.data({heartRate:t}),s(null,"Logged Heartbeat : "+t)}),o}function n(e){e(null,{timeout:36e5})}var i=e("./heartrate-btle.js"),o={type:"object",properties:{timeout:{type:"integer",required:!0}}};r.prototype.onEnable=function(){this.api.logActivity({type:this.name,html:"Heartbeat plugin enabled"})},r.prototype.onDisable=function(){this.api.logActivity({type:this.name,html:"Heartbeat plugin disabled"})},r.prototype.onInstall=function(){this.api.logActivity({type:this.name,html:"Heartbeat plugin installed"})},r.prototype.destroy=function(){i.destroy()},t.exports={Plugin:r,optionsSchema:o,getDefaultOptions:n}}).call(this,e("IrXUsu"),"undefined"!=typeof self?self:"undefined"!=typeof window?window:{},e("buffer").Buffer,arguments[3],arguments[4],arguments[5],arguments[6],"/fake_316f5cbc.js","/")},{"./heartrate-btle.js":2,IrXUsu:6,buffer:3}],2:[function(e,t){(function(){function e(e){if("initialized"==e.status){var t=window.localStorage.getItem(Z.addressKey);if(null==t){et("Bluetooth initialized successfully, starting scan for heart rate devices.");var r={serviceUuids:e.serviceUuids};V.startScan(n,i,r)}else c(t)}else et("Unexpected initialize status: "+e.status)}function r(e){tt("Initialize error: "+e.error+" - "+e.message)}function n(e){"scanResult"==e.status?(et("Stopping scan.."),V.stopScan(a,u),s(),window.localStorage.setItem(Z.addressKey,e.address),c(e.address)):"scanStarted"==e.status?(et("Scan was started successfully, stopping in 20 seconds"),rt=setTimeout(o,2e4)):et("Unexpected start scan status: "+e.status)}function i(e){et("Start scan error: "+e.error+" - "+e.message)}function o(){et("Scanning time out, stopping"),V.stopScan(a,u)}function s(){et("Clearing scanning timeout"),null!=rt&&clearTimeout(rt)}function a(e){et("scanStopped"==e.status?"Scan was stopped successfully":"Unexpected stop scan status: "+e.status)}function u(e){et("Stop scan error: "+e.error+" - "+e.message)}function c(e){et("Begining connection to: "+e+" with "+Z.timeout+" second timeout");var t={address:e};V.connect(f,d,t),nt=setTimeout(l,Z.timeout)}function f(e){"connected"==e.status?(tt(null,"Connected to : "+e.name+" - "+e.address),h(),g()):"connecting"==e.status?et("Connecting to : "+e.name+" - "+e.address):(et("Unexpected connect status: "+e.status),h())}function d(e){et("Connect error: "+e.error+" - "+e.message),h(),"connect"===e.error&&y()}function l(){et("Connection timed out")}function h(){et("Clearing connect timeout"),null!=nt&&clearTimeout(nt)}function g(){et("Disconnecting from device to test reconnect"),V.disconnect(p,v)}function p(e){"disconnected"==e.status?(et("Temp disconnect device and reconnecting in 1 second. Instantly reconnecting can cause issues"),setTimeout(y,3e3)):et("disconnecting"==e.status?"Temp disconnecting device":"Unexpected temp disconnect status: "+e.status)}function v(e){et("Temp disconnect error: "+e.error+" - "+e.message)}function y(){et("Reconnecting with 5 second timeout"),V.reconnect(b,m),it=setTimeout(w,5e3)}function b(e){if("connected"==e.status)if(tt(null,"Reconnected to : "+e.name+" - "+e.address),U(),window.device.platform==ot){tt(null,"Discovering heart rate service");var t={serviceUuids:Z.serviceUuids};V.services(E,I,t)}else window.device.platform==st&&(et("Beginning discovery"),V.discover(D,M));else"connecting"==e.status?et("Reconnecting to : "+e.name+" - "+e.address):(et("Unexpected reconnect status: "+e.status),q())}function m(e){et("Reconnect error: "+e.error+" - "+e.message),q()}function w(){et("Reconnection timed out")}function U(){et("Clearing reconnect timeout"),null!=it&&clearTimeout(it)}function E(e){if("discoveredServices"==e.status){var t=Z.serviceUuids;if(t)for(var r=0;r<t.length;r++){var n=t[r];if(n==Z.serviceUuid){et("Finding heart rate characteristics");var i={serviceUuid:Z.serviceUuid,characteristicUuids:[Z.measurementCharacteristicUuid]};return void V.characteristics(B,A,i)}}tt("Error: heart rate service not found")}else tt("Unexpected services heart status: "+e.status);q()}function I(e){tt("Services heart error: "+e.error+" - "+e.message),q()}function B(e){if("discoveredCharacteristics"==e.status){var t=e.characteristicUuids;if(t)for(var r=0;r<t.length;r++){et("Heart characteristics found, now discovering descriptor");var n=t[r];if(n==Z.measurementCharacteristicUuid){var i={serviceUuid:Z.serviceUuid,characteristicUuid:Z.measurementCharacteristicUuid};return void V.descriptors(S,L,i)}}et("Error: Heart rate measurement characteristic not found.")}else et("Unexpected characteristics heart status: "+e.status);q()}function A(e){et("Characteristics heart error: "+e.error+" - "+e.message),q()}function S(e){if("discoveredDescriptors"==e.status){et("Discovered heart descriptors, now discovering battery service");var t={serviceUuids:Z.batteryServiceUuids};V.services(C,x,t)}else et("Unexpected descriptors heart status: "+e.status),q()}function L(e){et("Descriptors heart error: "+e.error+" - "+e.message),q()}function C(e){if("discoveredServices"==e.status){var t=Z.batteryServiceUuids;if(t)for(var r=0;r<t.length;r++){var n=t[r];if(n==Z.batteryServiceUuid){et("Found battery service, now finding characteristic");var i={serviceUuid:Z.batteryServiceUuid,characteristicUuids:[Z.batteryLevelCharacteristicUuid]};return void V.characteristics(T,k,i)}}et("Error: battery service not found")}else et("Unexpected services battery status: "+e.status);q()}function x(e){et("Services battery error: "+e.error+" - "+e.message),q()}function T(e){if("discoveredCharacteristics"==e.status){var t=e.characteristicUuids;if(t)for(var r=0;r<t.length;r++){var n=t[r];if(n==Z.batteryLevelCharacteristicUuid)return void j()}et("Error: Battery characteristic not found.")}else et("Unexpected characteristics battery status: "+e.status);q()}function k(e){et("Characteristics battery error: "+e.error+" - "+e.message),q()}function D(e){"discovered"==e.status?(et("Discovery completed"),j()):(et("Unexpected discover status: "+e.status),q())}function M(e){et("Discover error: "+e.error+" - "+e.message),q()}function j(){et("Reading battery level");var e={serviceUuid:Z.batteryServiceUuid,characteristicUuid:Z.batteryLevelCharacteristicUuid};V.read(N,F,e)}function N(e){if("read"==e.status){var t=V.encodedStringToBytes(e.value);tt(null,"Battery level: "+t[0]),et("Subscribing to heart rate for "+Z.timeout+" seconds");var r={serviceUuid:Z.serviceUuid,characteristicUuid:Z.measurementCharacteristicUuid};V.subscribe(R,X,r),setTimeout(H,Z.timeout)}else et("Unexpected read status: "+e.status),q()}function F(e){tt("Read error: "+e.error+" - "+e.message),q()}function R(e){if("subscribedResult"==e.status){et("Subscription data received");var t=V.encodedStringToBytes(e.value);if(0==t.length)return void et("Subscription result had zero length data");var r,n=t[0];if(1==(1&n)){var i=t.buffer.slice(1,3),o=new Uint16Array(i)[0];r=o}else{var s=t.buffer.slice(1,2),a=new Uint8Array(s)[0];r=a}et("Heart Rate: "+r),$(document).trigger("heart-rate",r)}else"subscribed"==e.status?et("Subscription started"):(et("Unexpected subscribe status: "+e.status),q())}function X(){tt("Subscribe error: "+obj.error+" - "+obj.message),q()}function H(){et("Unsubscribing heart service");var e={serviceUuid:Z.serviceUuid,characteristicUuid:Z.measurementCharacteristicUuid};V.unsubscribe(P,z,e)}function P(e){if("unsubscribed"==e.status){et("Unsubscribed device"),et("Reading client configuration descriptor");var t={serviceUuid:Z.serviceUuid,characteristicUuid:Z.measurementCharacteristicUuid,descriptorUuid:Z.clientCharacteristicConfigDescriptorUuid};V.readDescriptor(K,O,t)}else et("Unexpected unsubscribe status: "+e.status),q()}function z(e){et("Unsubscribe error: "+e.error+" - "+e.message),q()}function K(e){if("readDescriptor"==e.status){var t=V.encodedStringToBytes(e.value),r=new Uint16Array(t.buffer);et("Read descriptor value: "+r[0]),q()}else et("Unexpected read descriptor status: "+e.status),q()}function O(e){et("Read Descriptor error: "+e.error+" - "+e.message),q()}function q(){V.disconnect(W,J)}function W(e){"disconnected"==e.status?(tt(null,"Disconnect device"),Y()):et("disconnecting"==e.status?"Disconnecting device":"Unexpected disconnect status: "+e.status)}function J(e){tt("Disconnect error: "+e.error+" - "+e.message)}function Y(){V.close(G,Q)}function G(e){et("closed"==e.status?"Closed device":"Unexpected close status: "+e.status)}function Q(e){tt("Close error: "+e.error+" - "+e.message)}var V=window.bluetoothle,Z={};Z.addressKey="heartbeat_address",Z.serviceUuid="180d",Z.serviceUuids=[Z.serviceUuid],Z.measurementCharacteristicUuid="2a37",Z.clientCharacteristicConfigDescriptorUuid="2902",Z.batteryServiceUuid="180f",Z.batteryLevelCharacteristicUuid="2a19",Z.batteryServiceUuids=[Z.batteryServiceUuid],Z.timeout=36e5,Z.debug=!0;var et=function(e){Z.debug&&console.log(e)},tt=function(){},rt=null,nt=null,it=null,ot="iOS",st="Android";t.exports={config:function(e,t){e&&(Z=_.extend(Z,e)),t.logIt&&(tt=t.logIt)},init:function(){return V?void V.initialize(e,r):et("BTLE Plugin not found :( ")},destroy:function(){window.localStorage.removeItem(Z.addressKey)}}}).call(this,e("IrXUsu"),"undefined"!=typeof self?self:"undefined"!=typeof window?window:{},e("buffer").Buffer,arguments[3],arguments[4],arguments[5],arguments[6],"/heartrate-btle.js","/")},{IrXUsu:6,buffer:3}],3:[function(e,t,r){(function(t,n,i){function i(e,t,r){if(!(this instanceof i))return new i(e,t,r);var n=typeof e;if("base64"===t&&"string"===n)for(e=C(e);e.length%4!==0;)e+="=";var o;if("number"===n)o=T(e);else if("string"===n)o=i.byteLength(e,t);else{if("object"!==n)throw new Error("First argument needs to be a number, array or string.");o=T(e.length)}var s;i._useTypedArrays?s=i._augment(new Uint8Array(o)):(s=this,s.length=o,s._isBuffer=!0);var a;if(i._useTypedArrays&&"number"==typeof e.byteLength)s._set(e);else if(D(e))for(a=0;o>a;a++)s[a]=i.isBuffer(e)?e.readUInt8(a):e[a];else if("string"===n)s.write(e,0,t);else if("number"===n&&!i._useTypedArrays&&!r)for(a=0;o>a;a++)s[a]=0;return s}function o(e,t,r,n){r=Number(r)||0;var o=e.length-r;n?(n=Number(n),n>o&&(n=o)):n=o;var s=t.length;O(s%2===0,"Invalid hex string"),n>s/2&&(n=s/2);for(var a=0;n>a;a++){var u=parseInt(t.substr(2*a,2),16);O(!isNaN(u),"Invalid hex string"),e[r+a]=u}return i._charsWritten=2*a,a}function s(e,t,r,n){var o=i._charsWritten=X(j(t),e,r,n);return o}function a(e,t,r,n){var o=i._charsWritten=X(N(t),e,r,n);return o}function u(e,t,r,n){return a(e,t,r,n)}function c(e,t,r,n){var o=i._charsWritten=X(R(t),e,r,n);return o}function f(e,t,r,n){var o=i._charsWritten=X(F(t),e,r,n);return o}function d(e,t,r){return q.fromByteArray(0===t&&r===e.length?e:e.slice(t,r))}function l(e,t,r){var n="",i="";r=Math.min(e.length,r);for(var o=t;r>o;o++)e[o]<=127?(n+=H(i)+String.fromCharCode(e[o]),i=""):i+="%"+e[o].toString(16);return n+H(i)}function h(e,t,r){var n="";r=Math.min(e.length,r);for(var i=t;r>i;i++)n+=String.fromCharCode(e[i]);return n}function g(e,t,r){return h(e,t,r)}function p(e,t,r){var n=e.length;(!t||0>t)&&(t=0),(!r||0>r||r>n)&&(r=n);for(var i="",o=t;r>o;o++)i+=M(e[o]);return i}function v(e,t,r){for(var n=e.slice(t,r),i="",o=0;o<n.length;o+=2)i+=String.fromCharCode(n[o]+256*n[o+1]);return i}function y(e,t,r,n){n||(O("boolean"==typeof r,"missing or invalid endian"),O(void 0!==t&&null!==t,"missing offset"),O(t+1<e.length,"Trying to read beyond buffer length"));var i=e.length;if(!(t>=i)){var o;return r?(o=e[t],i>t+1&&(o|=e[t+1]<<8)):(o=e[t]<<8,i>t+1&&(o|=e[t+1])),o}}function b(e,t,r,n){n||(O("boolean"==typeof r,"missing or invalid endian"),O(void 0!==t&&null!==t,"missing offset"),O(t+3<e.length,"Trying to read beyond buffer length"));var i=e.length;if(!(t>=i)){var o;return r?(i>t+2&&(o=e[t+2]<<16),i>t+1&&(o|=e[t+1]<<8),o|=e[t],i>t+3&&(o+=e[t+3]<<24>>>0)):(i>t+1&&(o=e[t+1]<<16),i>t+2&&(o|=e[t+2]<<8),i>t+3&&(o|=e[t+3]),o+=e[t]<<24>>>0),o}}function m(e,t,r,n){n||(O("boolean"==typeof r,"missing or invalid endian"),O(void 0!==t&&null!==t,"missing offset"),O(t+1<e.length,"Trying to read beyond buffer length"));var i=e.length;if(!(t>=i)){var o=y(e,t,r,!0),s=32768&o;return s?-1*(65535-o+1):o}}function w(e,t,r,n){n||(O("boolean"==typeof r,"missing or invalid endian"),O(void 0!==t&&null!==t,"missing offset"),O(t+3<e.length,"Trying to read beyond buffer length"));var i=e.length;if(!(t>=i)){var o=b(e,t,r,!0),s=2147483648&o;return s?-1*(4294967295-o+1):o}}function U(e,t,r,n){return n||(O("boolean"==typeof r,"missing or invalid endian"),O(t+3<e.length,"Trying to read beyond buffer length")),W.read(e,t,r,23,4)}function E(e,t,r,n){return n||(O("boolean"==typeof r,"missing or invalid endian"),O(t+7<e.length,"Trying to read beyond buffer length")),W.read(e,t,r,52,8)}function I(e,t,r,n,i){i||(O(void 0!==t&&null!==t,"missing value"),O("boolean"==typeof n,"missing or invalid endian"),O(void 0!==r&&null!==r,"missing offset"),O(r+1<e.length,"trying to write beyond buffer length"),P(t,65535));var o=e.length;if(!(r>=o))for(var s=0,a=Math.min(o-r,2);a>s;s++)e[r+s]=(t&255<<8*(n?s:1-s))>>>8*(n?s:1-s)}function B(e,t,r,n,i){i||(O(void 0!==t&&null!==t,"missing value"),O("boolean"==typeof n,"missing or invalid endian"),O(void 0!==r&&null!==r,"missing offset"),O(r+3<e.length,"trying to write beyond buffer length"),P(t,4294967295));var o=e.length;if(!(r>=o))for(var s=0,a=Math.min(o-r,4);a>s;s++)e[r+s]=t>>>8*(n?s:3-s)&255}function A(e,t,r,n,i){i||(O(void 0!==t&&null!==t,"missing value"),O("boolean"==typeof n,"missing or invalid endian"),O(void 0!==r&&null!==r,"missing offset"),O(r+1<e.length,"Trying to write beyond buffer length"),z(t,32767,-32768));var o=e.length;r>=o||(t>=0?I(e,t,r,n,i):I(e,65535+t+1,r,n,i))}function S(e,t,r,n,i){i||(O(void 0!==t&&null!==t,"missing value"),O("boolean"==typeof n,"missing or invalid endian"),O(void 0!==r&&null!==r,"missing offset"),O(r+3<e.length,"Trying to write beyond buffer length"),z(t,2147483647,-2147483648));var o=e.length;r>=o||(t>=0?B(e,t,r,n,i):B(e,4294967295+t+1,r,n,i))}function _(e,t,r,n,i){i||(O(void 0!==t&&null!==t,"missing value"),O("boolean"==typeof n,"missing or invalid endian"),O(void 0!==r&&null!==r,"missing offset"),O(r+3<e.length,"Trying to write beyond buffer length"),K(t,3.4028234663852886e38,-3.4028234663852886e38));var o=e.length;r>=o||W.write(e,t,r,n,23,4)}function L(e,t,r,n,i){i||(O(void 0!==t&&null!==t,"missing value"),O("boolean"==typeof n,"missing or invalid endian"),O(void 0!==r&&null!==r,"missing offset"),O(r+7<e.length,"Trying to write beyond buffer length"),K(t,1.7976931348623157e308,-1.7976931348623157e308));var o=e.length;r>=o||W.write(e,t,r,n,52,8)}function C(e){return e.trim?e.trim():e.replace(/^\s+|\s+$/g,"")}function x(e,t,r){return"number"!=typeof e?r:(e=~~e,e>=t?t:e>=0?e:(e+=t,e>=0?e:0))}function T(e){return e=~~Math.ceil(+e),0>e?0:e}function k(e){return(Array.isArray||function(e){return"[object Array]"===Object.prototype.toString.call(e)})(e)}function D(e){return k(e)||i.isBuffer(e)||e&&"object"==typeof e&&"number"==typeof e.length}function M(e){return 16>e?"0"+e.toString(16):e.toString(16)}function j(e){for(var t=[],r=0;r<e.length;r++){var n=e.charCodeAt(r);if(127>=n)t.push(e.charCodeAt(r));else{var i=r;n>=55296&&57343>=n&&r++;for(var o=encodeURIComponent(e.slice(i,r+1)).substr(1).split("%"),s=0;s<o.length;s++)t.push(parseInt(o[s],16))}}return t}function N(e){for(var t=[],r=0;r<e.length;r++)t.push(255&e.charCodeAt(r));return t}function F(e){for(var t,r,n,i=[],o=0;o<e.length;o++)t=e.charCodeAt(o),r=t>>8,n=t%256,i.push(n),i.push(r);return i}function R(e){return q.toByteArray(e)}function X(e,t,r,n){for(var i=0;n>i&&!(i+r>=t.length||i>=e.length);i++)t[i+r]=e[i];return i}function H(e){try{return decodeURIComponent(e)}catch(t){return String.fromCharCode(65533)}}function P(e,t){O("number"==typeof e,"cannot write a non-number as a number"),O(e>=0,"specified a negative value for writing an unsigned value"),O(t>=e,"value is larger than maximum value for type"),O(Math.floor(e)===e,"value has a fractional component")}function z(e,t,r){O("number"==typeof e,"cannot write a non-number as a number"),O(t>=e,"value larger than maximum allowed value"),O(e>=r,"value smaller than minimum allowed value"),O(Math.floor(e)===e,"value has a fractional component")}function K(e,t,r){O("number"==typeof e,"cannot write a non-number as a number"),O(t>=e,"value larger than maximum allowed value"),O(e>=r,"value smaller than minimum allowed value")}function O(e,t){if(!e)throw new Error(t||"Failed assertion")}var q=e("base64-js"),W=e("ieee754");r.Buffer=i,r.SlowBuffer=i,r.INSPECT_MAX_BYTES=50,i.poolSize=8192,i._useTypedArrays=function(){try{var e=new ArrayBuffer(0),t=new Uint8Array(e);return t.foo=function(){return 42},42===t.foo()&&"function"==typeof t.subarray}catch(r){return!1}}(),i.isEncoding=function(e){switch(String(e).toLowerCase()){case"hex":case"utf8":case"utf-8":case"ascii":case"binary":case"base64":case"raw":case"ucs2":case"ucs-2":case"utf16le":case"utf-16le":return!0;default:return!1}},i.isBuffer=function(e){return!(null===e||void 0===e||!e._isBuffer)},i.byteLength=function(e,t){var r;switch(e+="",t||"utf8"){case"hex":r=e.length/2;break;case"utf8":case"utf-8":r=j(e).length;break;case"ascii":case"binary":case"raw":r=e.length;break;case"base64":r=R(e).length;break;case"ucs2":case"ucs-2":case"utf16le":case"utf-16le":r=2*e.length;break;default:throw new Error("Unknown encoding")}return r},i.concat=function(e,t){if(O(k(e),"Usage: Buffer.concat(list, [totalLength])\nlist should be an Array."),0===e.length)return new i(0);if(1===e.length)return e[0];var r;if("number"!=typeof t)for(t=0,r=0;r<e.length;r++)t+=e[r].length;var n=new i(t),o=0;for(r=0;r<e.length;r++){var s=e[r];s.copy(n,o),o+=s.length}return n},i.prototype.write=function(e,t,r,n){if(isFinite(t))isFinite(r)||(n=r,r=void 0);else{var i=n;n=t,t=r,r=i}t=Number(t)||0;var d=this.length-t;r?(r=Number(r),r>d&&(r=d)):r=d,n=String(n||"utf8").toLowerCase();var l;switch(n){case"hex":l=o(this,e,t,r);break;case"utf8":case"utf-8":l=s(this,e,t,r);break;case"ascii":l=a(this,e,t,r);break;case"binary":l=u(this,e,t,r);break;case"base64":l=c(this,e,t,r);break;case"ucs2":case"ucs-2":case"utf16le":case"utf-16le":l=f(this,e,t,r);break;default:throw new Error("Unknown encoding")}return l},i.prototype.toString=function(e,t,r){var n=this;if(e=String(e||"utf8").toLowerCase(),t=Number(t)||0,r=void 0!==r?Number(r):r=n.length,r===t)return"";var i;switch(e){case"hex":i=p(n,t,r);break;case"utf8":case"utf-8":i=l(n,t,r);break;case"ascii":i=h(n,t,r);break;case"binary":i=g(n,t,r);break;case"base64":i=d(n,t,r);break;case"ucs2":case"ucs-2":case"utf16le":case"utf-16le":i=v(n,t,r);break;default:throw new Error("Unknown encoding")}return i},i.prototype.toJSON=function(){return{type:"Buffer",data:Array.prototype.slice.call(this._arr||this,0)}},i.prototype.copy=function(e,t,r,n){var o=this;if(r||(r=0),n||0===n||(n=this.length),t||(t=0),n!==r&&0!==e.length&&0!==o.length){O(n>=r,"sourceEnd < sourceStart"),O(t>=0&&t<e.length,"targetStart out of bounds"),O(r>=0&&r<o.length,"sourceStart out of bounds"),O(n>=0&&n<=o.length,"sourceEnd out of bounds"),n>this.length&&(n=this.length),e.length-t<n-r&&(n=e.length-t+r);var s=n-r;if(100>s||!i._useTypedArrays)for(var a=0;s>a;a++)e[a+t]=this[a+r];else e._set(this.subarray(r,r+s),t)}},i.prototype.slice=function(e,t){var r=this.length;if(e=x(e,r,0),t=x(t,r,r),i._useTypedArrays)return i._augment(this.subarray(e,t));for(var n=t-e,o=new i(n,void 0,!0),s=0;n>s;s++)o[s]=this[s+e];return o},i.prototype.get=function(e){return console.log(".get() is deprecated. Access using array indexes instead."),this.readUInt8(e)},i.prototype.set=function(e,t){return console.log(".set() is deprecated. Access using array indexes instead."),this.writeUInt8(e,t)},i.prototype.readUInt8=function(e,t){return t||(O(void 0!==e&&null!==e,"missing offset"),O(e<this.length,"Trying to read beyond buffer length")),e>=this.length?void 0:this[e]},i.prototype.readUInt16LE=function(e,t){return y(this,e,!0,t)},i.prototype.readUInt16BE=function(e,t){return y(this,e,!1,t)},i.prototype.readUInt32LE=function(e,t){return b(this,e,!0,t)},i.prototype.readUInt32BE=function(e,t){return b(this,e,!1,t)},i.prototype.readInt8=function(e,t){if(t||(O(void 0!==e&&null!==e,"missing offset"),O(e<this.length,"Trying to read beyond buffer length")),!(e>=this.length)){var r=128&this[e];return r?-1*(255-this[e]+1):this[e]}},i.prototype.readInt16LE=function(e,t){return m(this,e,!0,t)},i.prototype.readInt16BE=function(e,t){return m(this,e,!1,t)},i.prototype.readInt32LE=function(e,t){return w(this,e,!0,t)},i.prototype.readInt32BE=function(e,t){return w(this,e,!1,t)},i.prototype.readFloatLE=function(e,t){return U(this,e,!0,t)},i.prototype.readFloatBE=function(e,t){return U(this,e,!1,t)},i.prototype.readDoubleLE=function(e,t){return E(this,e,!0,t)},i.prototype.readDoubleBE=function(e,t){return E(this,e,!1,t)},i.prototype.writeUInt8=function(e,t,r){r||(O(void 0!==e&&null!==e,"missing value"),O(void 0!==t&&null!==t,"missing offset"),O(t<this.length,"trying to write beyond buffer length"),P(e,255)),t>=this.length||(this[t]=e)},i.prototype.writeUInt16LE=function(e,t,r){I(this,e,t,!0,r)},i.prototype.writeUInt16BE=function(e,t,r){I(this,e,t,!1,r)},i.prototype.writeUInt32LE=function(e,t,r){B(this,e,t,!0,r)},i.prototype.writeUInt32BE=function(e,t,r){B(this,e,t,!1,r)},i.prototype.writeInt8=function(e,t,r){r||(O(void 0!==e&&null!==e,"missing value"),O(void 0!==t&&null!==t,"missing offset"),O(t<this.length,"Trying to write beyond buffer length"),z(e,127,-128)),t>=this.length||(e>=0?this.writeUInt8(e,t,r):this.writeUInt8(255+e+1,t,r))},i.prototype.writeInt16LE=function(e,t,r){A(this,e,t,!0,r)},i.prototype.writeInt16BE=function(e,t,r){A(this,e,t,!1,r)},i.prototype.writeInt32LE=function(e,t,r){S(this,e,t,!0,r)},i.prototype.writeInt32BE=function(e,t,r){S(this,e,t,!1,r)},i.prototype.writeFloatLE=function(e,t,r){_(this,e,t,!0,r)},i.prototype.writeFloatBE=function(e,t,r){_(this,e,t,!1,r)},i.prototype.writeDoubleLE=function(e,t,r){L(this,e,t,!0,r)},i.prototype.writeDoubleBE=function(e,t,r){L(this,e,t,!1,r)},i.prototype.fill=function(e,t,r){if(e||(e=0),t||(t=0),r||(r=this.length),"string"==typeof e&&(e=e.charCodeAt(0)),O("number"==typeof e&&!isNaN(e),"value is not a number"),O(r>=t,"end < start"),r!==t&&0!==this.length){O(t>=0&&t<this.length,"start out of bounds"),O(r>=0&&r<=this.length,"end out of bounds");for(var n=t;r>n;n++)this[n]=e}},i.prototype.inspect=function(){for(var e=[],t=this.length,n=0;t>n;n++)if(e[n]=M(this[n]),n===r.INSPECT_MAX_BYTES){e[n+1]="...";break}return"<Buffer "+e.join(" ")+">"},i.prototype.toArrayBuffer=function(){if("undefined"!=typeof Uint8Array){if(i._useTypedArrays)return new i(this).buffer;for(var e=new Uint8Array(this.length),t=0,r=e.length;r>t;t+=1)e[t]=this[t];return e.buffer}throw new Error("Buffer.toArrayBuffer not supported in this browser")};var J=i.prototype;i._augment=function(e){return e._isBuffer=!0,e._get=e.get,e._set=e.set,e.get=J.get,e.set=J.set,e.write=J.write,e.toString=J.toString,e.toLocaleString=J.toString,e.toJSON=J.toJSON,e.copy=J.copy,e.slice=J.slice,e.readUInt8=J.readUInt8,e.readUInt16LE=J.readUInt16LE,e.readUInt16BE=J.readUInt16BE,e.readUInt32LE=J.readUInt32LE,e.readUInt32BE=J.readUInt32BE,e.readInt8=J.readInt8,e.readInt16LE=J.readInt16LE,e.readInt16BE=J.readInt16BE,e.readInt32LE=J.readInt32LE,e.readInt32BE=J.readInt32BE,e.readFloatLE=J.readFloatLE,e.readFloatBE=J.readFloatBE,e.readDoubleLE=J.readDoubleLE,e.readDoubleBE=J.readDoubleBE,e.writeUInt8=J.writeUInt8,e.writeUInt16LE=J.writeUInt16LE,e.writeUInt16BE=J.writeUInt16BE,e.writeUInt32LE=J.writeUInt32LE,e.writeUInt32BE=J.writeUInt32BE,e.writeInt8=J.writeInt8,e.writeInt16LE=J.writeInt16LE,e.writeInt16BE=J.writeInt16BE,e.writeInt32LE=J.writeInt32LE,e.writeInt32BE=J.writeInt32BE,e.writeFloatLE=J.writeFloatLE,e.writeFloatBE=J.writeFloatBE,e.writeDoubleLE=J.writeDoubleLE,e.writeDoubleBE=J.writeDoubleBE,e.fill=J.fill,e.inspect=J.inspect,e.toArrayBuffer=J.toArrayBuffer,e}}).call(this,e("IrXUsu"),"undefined"!=typeof self?self:"undefined"!=typeof window?window:{},e("buffer").Buffer,arguments[3],arguments[4],arguments[5],arguments[6],"/node_modules/gulp-browserify/node_modules/browserify/node_modules/buffer/index.js","/node_modules/gulp-browserify/node_modules/browserify/node_modules/buffer")},{IrXUsu:6,"base64-js":4,buffer:3,ieee754:5}],4:[function(e,t,r){(function(){var e="ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/";!function(t){"use strict";function r(e){var t=e.charCodeAt(0);return t===s?62:t===a?63:u>t?-1:u+10>t?t-u+26+26:f+26>t?t-f:c+26>t?t-c+26:void 0}function n(e){function t(e){c[d++]=e}var n,i,s,a,u,c;if(e.length%4>0)throw new Error("Invalid string. Length must be a multiple of 4");var f=e.length;u="="===e.charAt(f-2)?2:"="===e.charAt(f-1)?1:0,c=new o(3*e.length/4-u),s=u>0?e.length-4:e.length;var d=0;for(n=0,i=0;s>n;n+=4,i+=3)a=r(e.charAt(n))<<18|r(e.charAt(n+1))<<12|r(e.charAt(n+2))<<6|r(e.charAt(n+3)),t((16711680&a)>>16),t((65280&a)>>8),t(255&a);return 2===u?(a=r(e.charAt(n))<<2|r(e.charAt(n+1))>>4,t(255&a)):1===u&&(a=r(e.charAt(n))<<10|r(e.charAt(n+1))<<4|r(e.charAt(n+2))>>2,t(a>>8&255),t(255&a)),c}function i(t){function r(t){return e.charAt(t)}function n(e){return r(e>>18&63)+r(e>>12&63)+r(e>>6&63)+r(63&e)}var i,o,s,a=t.length%3,u="";for(i=0,s=t.length-a;s>i;i+=3)o=(t[i]<<16)+(t[i+1]<<8)+t[i+2],u+=n(o);switch(a){case 1:o=t[t.length-1],u+=r(o>>2),u+=r(o<<4&63),u+="==";break;case 2:o=(t[t.length-2]<<8)+t[t.length-1],u+=r(o>>10),u+=r(o>>4&63),u+=r(o<<2&63),u+="="}return u}var o="undefined"!=typeof Uint8Array?Uint8Array:Array,s="+".charCodeAt(0),a="/".charCodeAt(0),u="0".charCodeAt(0),c="a".charCodeAt(0),f="A".charCodeAt(0);t.toByteArray=n,t.fromByteArray=i}("undefined"==typeof r?this.base64js={}:r)}).call(this,e("IrXUsu"),"undefined"!=typeof self?self:"undefined"!=typeof window?window:{},e("buffer").Buffer,arguments[3],arguments[4],arguments[5],arguments[6],"/node_modules/gulp-browserify/node_modules/browserify/node_modules/buffer/node_modules/base64-js/lib/b64.js","/node_modules/gulp-browserify/node_modules/browserify/node_modules/buffer/node_modules/base64-js/lib")},{IrXUsu:6,buffer:3}],5:[function(e,t,r){(function(){r.read=function(e,t,r,n,i){var o,s,a=8*i-n-1,u=(1<<a)-1,c=u>>1,f=-7,d=r?i-1:0,l=r?-1:1,h=e[t+d];for(d+=l,o=h&(1<<-f)-1,h>>=-f,f+=a;f>0;o=256*o+e[t+d],d+=l,f-=8);for(s=o&(1<<-f)-1,o>>=-f,f+=n;f>0;s=256*s+e[t+d],d+=l,f-=8);if(0===o)o=1-c;else{if(o===u)return s?0/0:1/0*(h?-1:1);s+=Math.pow(2,n),o-=c}return(h?-1:1)*s*Math.pow(2,o-n)},r.write=function(e,t,r,n,i,o){var s,a,u,c=8*o-i-1,f=(1<<c)-1,d=f>>1,l=23===i?Math.pow(2,-24)-Math.pow(2,-77):0,h=n?0:o-1,g=n?1:-1,p=0>t||0===t&&0>1/t?1:0;for(t=Math.abs(t),isNaN(t)||1/0===t?(a=isNaN(t)?1:0,s=f):(s=Math.floor(Math.log(t)/Math.LN2),t*(u=Math.pow(2,-s))<1&&(s--,u*=2),t+=s+d>=1?l/u:l*Math.pow(2,1-d),t*u>=2&&(s++,u/=2),s+d>=f?(a=0,s=f):s+d>=1?(a=(t*u-1)*Math.pow(2,i),s+=d):(a=t*Math.pow(2,d-1)*Math.pow(2,i),s=0));i>=8;e[r+h]=255&a,h+=g,a/=256,i-=8);for(s=s<<i|a,c+=i;c>0;e[r+h]=255&s,h+=g,s/=256,c-=8);e[r+h-g]|=128*p}}).call(this,e("IrXUsu"),"undefined"!=typeof self?self:"undefined"!=typeof window?window:{},e("buffer").Buffer,arguments[3],arguments[4],arguments[5],arguments[6],"/node_modules/gulp-browserify/node_modules/browserify/node_modules/buffer/node_modules/ieee754/index.js","/node_modules/gulp-browserify/node_modules/browserify/node_modules/buffer/node_modules/ieee754")},{IrXUsu:6,buffer:3}],6:[function(e,t){(function(e){function r(){}var e=t.exports={};e.nextTick=function(){var e="undefined"!=typeof window&&window.setImmediate,t="undefined"!=typeof window&&window.postMessage&&window.addEventListener;if(e)return function(e){return window.setImmediate(e)};if(t){var r=[];return window.addEventListener("message",function(e){var t=e.source;if((t===window||null===t)&&"process-tick"===e.data&&(e.stopPropagation(),r.length>0)){var n=r.shift();n()}},!0),function(e){r.push(e),window.postMessage("process-tick","*")}}return function(e){setTimeout(e,0)}}(),e.title="browser",e.browser=!0,e.env={},e.argv=[],e.on=r,e.addListener=r,e.once=r,e.off=r,e.removeListener=r,e.removeAllListeners=r,e.emit=r,e.binding=function(){throw new Error("process.binding is not supported")},e.cwd=function(){return"/"},e.chdir=function(){throw new Error("process.chdir is not supported")}}).call(this,e("IrXUsu"),"undefined"!=typeof self?self:"undefined"!=typeof window?window:{},e("buffer").Buffer,arguments[3],arguments[4],arguments[5],arguments[6],"/node_modules/gulp-browserify/node_modules/browserify/node_modules/process/browser.js","/node_modules/gulp-browserify/node_modules/browserify/node_modules/process")},{IrXUsu:6,buffer:3}]},{},[1])(1)});