// ==UserScript==
// @name         New Userscript
// @namespace    http://tampermonkey.net/
// @version      0.44
// @description  try to take over the world!
// @author       You
// @match        https://t.bilibili.com/*
// @icon         https://www.google.com/s2/favicons?sz=64&domain=bilibili.com
// @grant        none
// ==/UserScript==

var urlList = {
    watchVideo: 'https://api.bilibili.com/x/click-interface/web/heartbeat',
    shareVideo: 'https://api.bilibili.com/x/web-interface/share/add',
    dynamic: 'https://api.bilibili.com/x/polymer/web-dynamic/v1/feed/all?timezone_offset=-480&type=all&page=1'
}
var csrftoken = document.cookie.match(/(?<=bili_jct=).+?(?=;)/);


window.onload = function () {
    if (!csrftoken) {
        console.log('csrf不存在')
        return;
    }

    //获取动态列表
    console.log('正在获取动态列表')
    fetch(urlList.dynamic, {
        credentials: 'include',
    }).then(function (res) {
        return res.json();
    }).then(function (data) {
        console.log('接收到返回数据')
        if (!data.data.items.length) {
            console.log('列表为空...')
        } else {
            console.log('正在检索列表')
            var hasVideo = false;
            for (var i = 0; ; i++) {
                console.log('正在检索第' + i + '项')
                if (data.data.items[i].type == 'DYNAMIC_TYPE_AV') {
                    var aid = data.data.items[i].basic.comment_id_str
                    console.log('已找到：第' + i + '项，id: ' + aid)
                    shareVideo(aid)
                    watchVideo(aid)
                    hasVideo = true;
                    break;
                }
            }

            if (!hasVideo) {
                console.log('列表检索完毕，没有\'视频\'类型的动态。')
            }
        }
    })

}

//分享视频（无效）
function shareVideo(aid) {
    console.log('正在分享视频，aid=' + aid)
    fetch(urlList.shareVideo, {
        method: 'post',
        credentials: 'include',
        headers: {
            'Accept': 'application/json, text/plain, */*',
            'Content-Type': 'application/x-www-form-urlencoded'
        },
        body: 'aid=' + aid + '&csrf=' + csrftoken
    }).then(function (res) {
        return res.json()
    }).then(function (data) {
        console.log(data)
    }).catch(function (err) {
        console.log(err)
    })
}

//观看视频（无效）
function watchVideo(aid) {
    console.log('正在观看视频，aid=' + aid)
    fetch(urlList.watchVideo, {
        method: 'post',
        credentials: 'include',
        headers: {
            'Accept': 'application/json, text/plain, */*',
            'Content-Type': 'application/x-www-form-urlencoded'
        },
        body: 'aid=' + aid
    }).then(function (res) {
        return res.json()
    }).then(function (data) {
        console.log(data)
    }).catch(function (err) {
        console.log(err)
    })
}