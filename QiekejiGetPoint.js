// ==UserScript==
// @name         Qiekeji_GetPoint
// @namespace    http://tampermonkey.net/
// @version      1.23
// @description  胖乖洗衣 脚本 自动刷积分 完成每日任务
// @author       ICONQUESTION
// @match        https://t.bilibili.com/*
// @icon         https://www.bilibili.com/favicon.ico
// @grant        GM_xmlhttpRequest
// ==/UserScript==

var isDebugging = localStorage.getItem("qie_isDebugging");
if (isDebugging) console.warn("Debugging mode is ON.");


// check if has finished from cookie
// if isFinished=1 and isDebugging=false, then return
if (document.cookie.replace(/(?:(?:^|.*;\s*)isFinished\s*\=\s*([^;]*).*$)|^.*$/, "$1",) && !isDebugging) {
    console.log("All tasks have already been finished. \nTotal points: " + await getTotalPoints());
    return;
}
console.log("Start working.");


// check if token exists
if (!localStorage.getItem("qietoken") || localStorage.getItem("qietoken") == 'null') {
    localStorage.setItem("qietoken", prompt("Token is not found. Please update the token below!"));
}
var token = localStorage.getItem("qietoken");

var headers = {
    "Content-Type": "application/x-www-form-urlencoded; charset=utf-8",
    "User-Agent": "QEUser/1.57.2 (com.qiekj.QEUser; build:1.1; iOS 17.4.1) Alamofire/5.6.4",
    "Sec-Ch-Ua": "",
    "Sec-Ch-Ua-Platform": "",
    "Sec-Ch-Ua-Mobile": "",
    "Dnt": "",
    "Sec-Fetch-Site": "",
    "Sec-Fetch-Mode": "",
    "Sec-Fetch-Dest": "",
    "Priority": "",
};


// check if token is valid
if (!await checkTokenValidity()) {
    console.error("Token is invalid.");
    return;
}
console.log("Token is vaild.");


// sign in
if (!await checkSignIn()) {
    // not signed in
    console.log("Not signed in today. Sign in now.");
    if (!signIn()) { console.error("Sign in failed.") } else { console.log("Sign in successful.") }
} else {
    // already signed in
    console.log("Already signed in today.");
}


// prepare taskActions
var taskActions = {
    '1': async function (n) {
        /**
         * title:   浏览商品赚积分
         * return:  none
         */

        var taskName = "浏览商品赚积分";
        console.log("Task: " + taskName + ", Count: " + n);

        // get item list
        await new Promise((resolveAll, rejectAll) => {
            GM_xmlhttpRequest({
                "method": "POST",
                "url": "https://qemyapi.qiekj.com/api/search_item_list",
                "headers": headers,
                "anonymous": true,
                "response": "json",
                "data": "keyWord=%e9%9b%b6%e9%a3%9f&page=1&pageSize=20",
                "onload": async function (response) {
                    var data = JSON.parse(response.response);
                    console.log(data);

                    if (response.status != 200 || data.code != 0 || !data.data) rejectAll("Task " + taskName + ": Error in returned data when searching the items.");

                    for (var i = 0; i < n; i++) {
                        console.log("Task " + taskName + " count: " + i + " of " + n);

                        //randomly select one of the item_ids
                        var item = data.data.data[Math.trunc(Math.random() * data.data.data.length)], itemid = item.item_id;
                        console.log(item);

                        /*
                        example:
                        {"code":0,"msg":"成功","data":null,"t":1698674306364}
                        */

                        await new Promise((resolve, reject) => {
                            GM_xmlhttpRequest({
                                "method": "POST",
                                "url": "https://userapi.qiekj.com/integralUmp/rewardIntegral",
                                "headers": headers,
                                "anonymous": true,
                                "data": "itemCode=" + itemid + "&token=" + token,
                                "responseType": "json",
                                "onload": function (response) {
                                    console.log(response.response);
                                    if (response.status != 200 || response.response.code != 0 || !response.response.msg) {
                                        n = 0;
                                        reject("Task " + taskName + ": Error when viewing the items.");
                                    } else {
                                        resolve();
                                    }
                                }
                            });
                        })
                    }

                    resolveAll();
                }
            });
        }).catch((e) => {
            console.error(e);
        });
        console.log("Task " + taskName + " is done.");
    },
    '2': async function (n) {
        /**
         * title:   看视频赚积分
         * return:  none
         */
        var taskName = "看视频赚积分";
        console.log("Task: " + taskName + ", Totalcount: " + n);

        for (var i = 0; i < n; i++) {
            console.log("Task " + taskName + "  count: " + i + " of " + n);

            await new Promise((resolve, reject) => {
                GM_xmlhttpRequest({
                    "method": "POST",
                    "url": "https://userapi.qiekj.com/task/completed",
                    "headers": headers,
                    "anonymous": true,
                    "data": "taskType=2&token=" + token,
                    "responseType": "json",
                    "onload": function (response) {
                        /*
                        example:
                        {"code":0,"msg":"成功","data":true,"t":1698728364755}
                        */
                        console.log(response.response);
                        if (response.status != 200 || response.response.code != 0 || !response.response.msg) {
                            reject("Task " + taskName + ": Error in returned data.");
                            n = 0;
                        } else {
                            resolve();
                        }
                    },
                });
            }).catch((e) => {
                console.error(e);
            });
        }
        console.log("Task " + taskName + " is done.");
    },
};


// get task status and finish tasks
await getTaskStatus().then(async (items) => {
    var itemCount = items.length;

    await new Promise((resolve) => {
        items.forEach(async (element, index) => {
            console.log("Checking task " + (index + 1) + " of " + itemCount);
            console.log(element);

            // data integrity check
            if (element.completedStatus === undefined || element.taskCode === undefined) {
                console.error("Error in returned tasklist data: Incomplete data.");
                return;
            }

            // check if task has been finished and if the correspond taskcode exists
            if (!element.completedStatus) {
                if (!taskActions[element.taskCode]) {
                    // we do not know how to complete the task
                    console.warn("Task " + (index + 1) + " " + element.title + " with taskcode " + element.taskCode + " does not have correspond taskcode in table. Skipped.");

                    /**
                     *                     await new Promise((resolve, reject) => {
                        GM_xmlhttpRequest({
                            "method": "POST",
                            "url": "https://userapi.qiekj.com/task/completed",
                            "headers": headers,
                            "anonymous": true,
                            "data": "taskCode=" + element.taskCode + "&token=" + token,
                            "responseType": "json",
                            "onload": function (response) {
                                
                                example:
                                {"code":0,"msg":"成功","data":true,"t":1698728364755}
                                
                                console.log(response.response);
                                if (response.status != 200 || response.response.code != 0 || !response.response.msg) {
                                    reject("Task " + element.title + ": Error in returned data.");
                                    n = 0;
                                } else {
                                    resolve();
                                }
                            },
                        });
                    }).catch((e) => {
                        console.error(e);
                    });
                     */

                } else {
                    // complete the task
                    console.log("Start doing task " + element.title + ", taskCode: " + element.taskCode + ", title: " + element.title + ", dailyTaskLimit: " + element.dailyTaskLimit);
                    await taskActions[element.taskCode](element.dailyTaskLimit - element.completedSumFreq);
                    console.log("Total points: " + await getTotalPoints());
                }
            } else {
                console.info("Task " + element.title + " has already been finished. Skipped.");
            }
            // when the last one is completed, return
            if (index + 1 >= itemCount) resolve();
        });
    })

    console.log("All tasks have been finished! \nTotal points: " + await getTotalPoints());

    // set cookie to mark that all tasks have been finished, which will expire at the second day.
    var a = new Date();
    a.setHours(24, 0, 0, 0);
    document.cookie = "isFinished=1; expires=" + a.toUTCString();
}).catch((e) => {
    console.error(e);
})


/**
 * functions
 */

async function checkTokenValidity() {
    /**
     * return:
     * true:    tokenIsValid
     * false:   tokenIsNotValid
     */

    console.log("checkTokenValidity");

    return await new Promise((resolve) => {
        GM_xmlhttpRequest({
            "method": "POST",
            "url": "https://userapi.qiekj.com/user/info",
            "headers": headers,
            "anonymous": true,
            "data": "token=" + token,
            "responseType": "json",
            "onload": async function (response) {
                /**
                 * response:
                 * code: 0  msg: 成功
                 * code: 2  msg: 未登录
                 * ...
                 */
                console.log(response.response);
                if (response.status != 200 || response.response.code === undefined || response.response.msg === undefined || response.response.data === undefined)
                    reject("checkTokenValidity(): Error in returned data.");
                resolve(response.response.code === 0);
            }
        });
    }).catch((e) => {
        console.error(e);
    });
}

async function getTaskStatus() {
    /**
     * return:
     * json
     */

    console.log("getTaskStatus");

    return await new Promise((resolve, reject) => {
        GM_xmlhttpRequest({
            "method": "POST",
            "url": "https://userapi.qiekj.com/task/list",
            "headers": headers,
            "anonymous": true,
            "data": "token=" + token,
            "responseType": "json",
            "onload": async function (response) {
                console.log(response.response);
                if (response.status != 200 || response.response.code != 0 || response.response.data === undefined || response.response.data.items === undefined) reject("getTaskStatus(): Error in returned data.");
                resolve(response.response.data.items);
            }
        });
    });
}

async function checkSignIn() {
    /**
     * return:
     * true:   alreadySignedIn
     * false:   notSignedIn
     */

    console.log("checkSignIn");

    return await new Promise((resolve, reject) => {
        GM_xmlhttpRequest({
            "method": "POST",
            "url": "https://userapi.qiekj.com/signin/todaySignIn",
            "headers": headers,
            "anonymous": true,
            "responseType": "json",
            "data": "activityId=600001&token=" + token,
            "onload": function (response) {
                /**
                 * return example:
                 * {"code":0,"msg":"成功","data":{"isSignIn":false},"t":1716894394717}
                 */
                console.log(response.response);
                if (response.status != 200 || response.response.code != 0 || !response.response.data || response.response.data.isSignIn === undefined)
                    reject("Error in returned data.");
                resolve(response.response.data.isSignIn);
            },
        })
    }).catch((e) => {
        console.error(e);
    })
}

async function signIn() {
    /**
     * return:
     * true:    success
     * false:   failed
     */
    console.log("signIn");

    await new Promise((resolve, reject) => {
        GM_xmlhttpRequest({
            "method": "POST",
            "url": "https://userapi.qiekj.com/signin/doUserSignIn",
            "headers": headers,
            "anonymous": true,
            "responseType": "json",
            "data": "activityId=600001&token=" + token,
            "onload": function (response) {
                /**
                 * return example:
                 * {"code":0,"msg":"成功","data":{"totalDays":2,"totalIntegral":8,"nextIntegral":10,"signInResult":true,"failReason":null},"t":1716894395309}
                 */
                console.log(response.response);
                if (response.status != 200 || response.response.code != 0 || response.response.data === undefined || response.response.data.signInResult === undefined) reject("signIn(): Error in returned data.");
                resolve(response.response.data.signInResult);
            },
        });
    }).catch((e) => {
        console.error(e);
    });
}

async function getTotalPoints() {
    console.log("getTotalIntegral");

    return await new Promise((resolve, reject) => {
        GM_xmlhttpRequest({
            "method": "POST",
            "url": "https://userapi.qiekj.com/signin/getTotalIntegral",
            "headers": headers,
            "anonymous": true,
            "responseType": "json",
            "data": "token=" + token,
            "onload": function (response) {
                /*
                example:
                {"code":0,"msg":"成功","data":15,"t":1698728169435}
                */
                console.log(response.response);
                if (response.status != 200 || response.response.code != 0 || response.response.data === undefined) reject("getTotalIntegral(): Error in returned data.");
                resolve(response.response.data);
            }
        })
    })

}

function sleep(time) {
    console.log("Sleep for " + time + " ms");
    return new Promise((resolve) => setTimeout(resolve, time));
}