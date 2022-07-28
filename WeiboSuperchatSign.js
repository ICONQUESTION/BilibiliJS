// ==UserScript==
// @name         WeiboSuperchatSign
// @namespace    https://github.com/ICONQUESTION
// @version      0.16
// @description  hello, world
// @author       ICONQUESTION
// @match        https://weibo.com/*
// @icon         https://weibo.com/favicon.ico
// @grant        none
// ==/UserScript==

window.onload = function () {
    //将document.cookie中的'; '替换为'&'，从而满足生成URL对象的条件，再利用URL对象的searchParam功能完成cookie检索
    var cookies = new URL('http://hello.world/test?' + document.cookie.replaceAll('; ', '&'))
    var superchatID = cookies.searchParams.get('superchatID');

    if (!superchatID) {
        var id = prompt('请输入需要自动签到的超话的ID： ')
        if (!id) {
            console.log('用户已取消')
            return
        } else {
            document.cookie = 'superchatID=' + id;
            superchatID=id;
        }
    }

    fetch('https://weibo.com/p/aj/general/button?ajwvr=6&api=http://i.huati.weibo.com/aj/super/checkin&texta=%E7%AD%BE%E5%88%B0&textb=%E5%B7%B2%E7%AD%BE%E5%88%B0&status=0&id=' + superchatID + '&location=page_100808_super_index&timezone=GMT+0800&lang=zh-cn&plat=Win32&ua=Mozilla/5.0%20(Windows%20NT%2010.0;%20Win64;%20x64)%20AppleWebKit/537.36%20(KHTML,%20like%20Gecko)%20Chrome/103.0.5060.114%20Safari/537.36%20Edg/103.0.1264.62&screen=1536*864&__rnd=' + new Date().getTime(), {
        credentials: 'include',
        Headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
            'Accept': '*/*',
            'Accept-Encoding': 'gzip, deflate'
        },
    }).then(function (res) {
        return res.headers.get('Content-Type').search('application/json') != -1 ? res.json() : undefined
    }).then(function (data) {
        //console.log(data)
        if (!data || !data.data || !data.msg || !data.code) {
            console.log('fetch() 返回数据异常。')
        }
        console.log('id为 '+superchatID+' 的签到情况：')
        console.log(data.code)
        console.log(data.msg)
        console.log(data.data.length ? data.data : '没有返回data哦~')
    })
}