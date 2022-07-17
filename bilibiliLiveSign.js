// ==UserScript==
// @name         bilibiliLiveSign
// @namespace    https://iconquestion.github.io/
// @version      0.51
// @description  Hello!
// @author       Microsoft365
// @match        https://t.bilibili.com/go
// @icon         https://bilibili.com/favicon.ico
// @grant        none
// ==/UserScript==

window.onload = function () {
    console.log('正在签到')
    fetch('https://api.live.bilibili.com/xlive/web-ucenter/v1/sign/DoSign', {
        credentials: 'include',
    }).then(function (res) {
        return res.headers.get('Content-Type').search('application/json') != -1 ? res.json() : -1
    }).then(function (data) {
        //console.log(data)
        if (data == -1) {
            console.log('fetch 返回数据异常。')
            return
        }

        console.log(data.data ? data.data.text + '\n' + data.data.specialText : data.message)
    })
}


