// ==UserScript==
// @name         bilibiliGetExp
// @namespace    http://tampermonkey.net/
// @version      0.94
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

//将document.cookie中的'; '替换为'&'，从而满足生成URL对象的条件，再利用URL对象的searchParam功能完成cookie检索
var cookies = new URL('http://hello.world/test?' + document.cookie.replaceAll('; ', '&'))

var csrftoken = cookies.searchParams.get('bili_jct')
var mid = cookies.searchParams.get('DedeUserID')
var access_key = cookies.searchParams.get('access_key')

var currentTime = parseInt((new Date().getTime()) / 1000);



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

                shareVideo1(aid, cid)//客户端视频分享
                watchVideo(aid, bvid, cid)//视频观看
            })
        }
    })
}



//分享视频
function shareVideo1(aid, cid) {
    console.log('正在分享视频, aid=' + aid)

    if (!access_key) {
        console.log('无access_key, 正在请求新access_key')

        fetch(urlList.getAccess_key, {
            credentials: 'include',
        }).then(function (res) {
            return res.headers.get('Content-Type').search('application/json') != -1 ? res.json() : undefined
        }).then(function (data) {
            if (!data || !data.data || !data.data.confirm_uri) {
                console.log('返回数据异常。程序将退出。')
                return
            }

            console.log('请右键以下链接，点击"在新标签页中打开"，然后复制查询字符串中的access_key字段，粘贴到这里')
            console.log(data.data.confirm_uri)

            var accesskey = prompt('请打开浏览器控制台，右键最下方的链接，点击"在新标签页中打开"，然后复制查询字符串中的access_key字段，粘贴到这里')
            if (accesskey) {
                document.cookie = 'access_key=' + accesskey + '; max-age=15552000; domain=.bilibili.com'
                shareVideo2(aid, cid)
            } else {
                console.log('用户已取消操作。')
            }

        }).catch(function (err) {
            console.log(err)
        })

    } else {
        console.log('已检测到access_key')
        console.log(access_key)
        shareVideo2(aid, cid)
    }
}


function shareVideo2(aid, cid) {
    var body = 'access_key=' + access_key + '&appkey=1d8b6e7d45233436&build=6800300&c_locale=zh_CN&channel=bili&disable_rcmd=0&from_spmid=dt.dt.video.0&mobi_app=android&oid=' + aid + '&panel_type=1&platform=android&s_locale=zh_CN&share_channel=biliDynamic&share_id=main.ugc-video-detail.0.0.pv&share_origin=vinfo_share&share_session_id=' + '6609bb15-ac05-4118-8f12-cbc4959672d3' + '&sid=' + cid + '&spm_id=main.ugc-video-detail.0.0&statistics=%7B%22appId%22%3A1%2C%22platform%22%3A3%2C%22version%22%3A%226.80.0%22%2C%22abtest%22%3A%22%22%7D&success=true&ts=' + currentTime + '&sign='
    body = body + md5(body + '560c52ccd288fed045859ed18bffd973')

    console.log('正在请求分享API')

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
    }).catch(function (err) {
        console.log(err)
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