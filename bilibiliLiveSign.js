// ==UserScript==
// @name         bilibiliLiveSign
// @namespace    https://iconquestion.github.io/
// @version      0.2
// @description  Hello!
// @author       Microsoft365
// @match        https://t.bilibili.com
// @icon         data:image/gif;base64,R0lGODlhAQABAAAAACH5BAEKAAEALAAAAAABAAEAAAICTAEAOw==
// @grant        none
// ==/UserScript==

(function() {
    'use strict';
    fetch('https://api.live.bilibili.com/xlive/web-ucenter/v1/sign/DoSign',{
        method:'get',
        credentials:'include',
        headers:{
            Origin: 'https://link.bilibili.com',
        }
    });
})();
