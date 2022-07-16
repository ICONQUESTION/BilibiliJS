// ==UserScript==
// @name         bilibiliGetExp
// @namespace    http://tampermonkey.net/
// @version      0.82
// @description  try to take over the world!
// @author       You
// @match        https://t.bilibili.com/go
// @icon         https://bilibili.com/favicon.ico
// @grant        none
// @require      https://cdn.bootcss.com/blueimp-md5/2.10.0/js/md5.js
// ==/UserScript==

var urlList = {
    watchVideo: 'https://api.bilibili.com/x/click-interface/web/heartbeat',
    shareVideo: 'https://api.biliapi.net/x/share/finish',
    dynamic: 'https://api.bilibili.com/x/polymer/web-dynamic/v1/feed/all?timezone_offset=-480&type=video&page=1',
    videoProperty: 'https://api.bilibili.com/x/player/pagelist',
    getAccess_key: 'https://passport.bilibili.com/login/app/third?appkey=1d8b6e7d45233436&api=http://link.acg.tv/forum.php&sign=5f9c0a5c2360c80b858d546a23a4a9dd',
}
var csrftoken = document.cookie.match(/(?<=bili_jct=).+?(?=;)/);
var currentTime = parseInt((new Date().getTime()) / 1000);
var mid = document.cookie.match(/(?<=DedeUserID=).+?(?=;)/);
var access_key = document.cookie.match(/(?<=access_key=).+?(?=;)/);


//从这里开始执行
window.onload = function () {
    if (!csrftoken || !mid) {
        console.log('csrf或mid不存在，请登录。如果您已经登录，请尝试清空cookies后重新登录。')
        return;
    }

    //获取动态列表
    console.log('正在获取动态列表')

    fetch(urlList.dynamic, {
        credentials: 'include',
    }).then(function (res) {
        return res.json();
    }).then(function (data) {
        console.log('正在处理返回数据')
        if (!data.data.items.length) {
            console.log('列表为空。')
        } else {
            var aid = data.data.items[0].basic.comment_id_str
            var bvid = data.data.items[0].modules.module_dynamic.major.archive.bvid
            console.log('找到1项, aid: ' + aid + ', bvid= ' + bvid + ', 正在获取视频cid')

            fetch(urlList.videoProperty + '?bvid=' + bvid + '&jsonp=jsonp', {
                method: 'GET',
                credentials: 'include',
                headers: {
                    'Accept': '*/*',
                    'Content-Type': 'application/x-www-form-urlencoded',
                    'Accept-Encoding': 'gzip, deflate',
                    'Accept-Language': 'zh-CN,zh;q=0.9',
                },
            }).then(function (rawData) {
                return rawData.json();
            }).then(function (data) {
                var cid = data.data[0].cid
                console.log('视频cid: ' + cid)

                shareVideo(aid, cid)//客户端视频分享
                //  watchVideo(aid, bvid, cid)//视频观看
            })
        }
    })
}


//分享视频
function shareVideo(aid, cid) {
    console.log('正在分享视频, aid=' + aid)
    console.log(access_key)

    if (!access_key) {
        console.log('无access_key, 正在请求新access_key')
        return
        //GET
        fetch(urlList.getAccess_key, {
            credentials: 'include',
        }).then(function (res) {
            var a = res.headers.get('Content-Type').search('application/json')
            console.log(a)
            return a != -1 ? res.json() : undefined
        }).then(function (data) {
            if (!data || !data.data || !data.data.confirm_uri) {
                console.log('返回数据异常。程序将退出。')
                return
            }
            console.log(data)

            var uri = data.data.confirm_uri
            console.log(uri)
            fetch(uri, {
                credentials: 'include',
                redirect: 'manual'
            }).then(function (res) {
                //暂时不知道如何获取location字段...
                console.log(res)
                console.log(res.headers.get('Location'))
            }).catch(function (err) {
                console.log(err)
            })

        }).catch(function (err) {
            console.log(err)
        })
    }

    var body = 'access_key=' + access_key + '&appkey=1d8b6e7d45233436&build=6800300&c_locale=zh_CN&channel=bili&disable_rcmd=0&from_spmid=dt.dt.video.0&mobi_app=android&oid=' + aid + '&panel_type=1&platform=android&s_locale=zh_CN&share_channel=biliDynamic&share_id=main.ugc-video-detail.0.0.pv&share_origin=vinfo_share&share_session_id=' + '6609bb15-ac05-4118-8f12-cbc4959672d3' + '&sid=' + cid + '&spm_id=main.ugc-video-detail.0.0&statistics=%7B%22appId%22%3A1%2C%22platform%22%3A3%2C%22version%22%3A%226.80.0%22%2C%22abtest%22%3A%22%22%7D&success=true&ts=' + currentTime + '&sign='
    body = body + md5(body + '560c52ccd288fed045859ed18bffd973')

    fetch(urlList.shareVideo, {
        method: 'post',
        mode: 'no-cors',
        referrer: "no-referrer",
        headers: {
            'Buvid': 'XXAF685A25ED66209F45C4248C26054E197A8',
            'Fp_local': '9ca222f943ae8680669b6cdf2da959e120220715131357006bc66326e8302881',
            'Fp_remote': '9ca222f943ae8680669b6cdf2da959e1202207131056235c836389e254a11b4e',
            'Session_id': '831ec2b1',//暂时不知道如何处理
            'Env': 'prod',
            'App-Key': 'android',
            'User-Agent': 'Mozilla/5.0 BiliDroid/6.80.0 (bbcallen@gmail.com) os/android model/SM-G9730 mobi_app/android build/6800300 channel/bili innerVer/6800300 osVer/7.1.2 network/2',
            'X-Bili-Trace-Id': '390743e355a59747842729ca1962d222:8427c9ca1962d222:0:0',//暂时不知道如何处理
            'X-Bili-Aurora-Eid': 'UlYITlUAD1ID',
            'X-Bili-Mid': mid,
            'X-Bili-Aurora-Zone': '',
            'Content-Type': 'application/x-www-form-urlencoded; charset=utf-8',
            'Accept-Encoding': 'gzip',
        },
        body: body,
    }).then(function (res) {
        return res.json();
    }).then(function (data) {
        console.log(data)
    })

}


//观看视频
function watchVideo(aid, bvid, cid) {
    console.log('正在观看视频, aid=' + aid + ', bvid= ' + bvid + ', cid= ' + cid)
    fetch(urlList.watchVideo, {
        method: 'post',
        credentials: 'include',
        headers: {
            'Accept': 'application/json, text/javascript, */*; q=0.01',
            'Content-Type': 'application/x-www-form-urlencoded'
        },
        body:
            'aid=' + aid + '&cid=' + cid + '&bvid=' + bvid + '&mid=' + mid + '&csrf=' + csrftoken + '&played_time=11&real_played_time=12&realtime=11&start_ts=' + currentTime + '&type=3&dt=2&play_type=2&from_spmid=444.41.list.card_archive.click&spmid=333.788.0.0&auto_continued_play=0&refer_url=https%3A%2F%2Ft.bilibili.com%2F%3Ftab%3Dvideo&bsource='
    }).then(function (res) {
        return res.json()
    }).then(function (data) {
        console.log(data)
    }).catch(function (err) {
        console.log(err)
    })
}