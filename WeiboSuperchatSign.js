// ==UserScript==
// @name         WeiboSuperchatSign
// @namespace    https://github.com/ICONQUESTION
// @version      0.30
// @description  hello, world
// @author       ICONQUESTION
// @match        https://weibo.com/*
// @icon         https://weibo.com/favicon.ico
// @grant        none
// ==/UserScript==


window.onload = function () {
    var cookies = new URL('http://hello.world/test?' + document.cookie.replaceAll('; ', '&'))
    var superchatID = localStorage.getItem('superchatID');

    //调试性开关
    /*
    var debugMode = {
        'true': '无论返回数据显示任务是否完成，都再执行一次',
        'false': '根据返回数据情况，有选择地执行'
    }
    */
    var debugMode = localStorage && localStorage.getItem('debugMode') != undefined ? localStorage.getItem('debugMode') : false

    /*
    var cookieRecordComesFirst={
        'true':'以cookies中的任务完成记录为准',
        'false':'以fetch请求返回的数据为准'
    }
    */
    var cookieRecordComesFirst = localStorage && localStorage.getItem('cookieRecordComesFirst') != undefined ? localStorage.getItem('cookieRecordComesFirst') : true


    if (!superchatID) {
        var id = prompt('请输入需要自动签到的超话的ID： ')
        if (!id) {
            console.log('用户已取消')
            return
        } else {
            localStorage.setItem('superchatID', id)
            superchatID = id;
        }
    }

    if (debugMode) console.log('debugMode: On')
    cookieRecordComesFirst ? console.log('当前模式：cookies记录为主') : console.log('当前模式：fetch')

    if (!cookieRecordComesFirst || !cookies.searchParams.get(superchatID) || debugMode) {
        console.log('正在签到')
        doSign(superchatID)
    } else {
        console.log('今天已经签到过啦')
    }
}

function doSign(superchatID) {
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
            return
        }

        console.log('id为 ' + superchatID + ' 的签到情况：')
        console.log(data.code)
        console.log(data.msg)
        console.log(data.data.length ? data.data : '没有返回data哦~')

        //date用来设置记录性cookies过期时间为第二天0:0:0
        var date = new Date()
        date.setTime(date.getTime() + 3600 * 24 * 1000)
        date.setHours(0, 0, 0, 0)

        document.cookie = superchatID + '=true; expires=' + date.toUTCString()
    })
}