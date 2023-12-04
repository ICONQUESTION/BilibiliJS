//胖乖洗衣 脚本 自动刷积分 完成每日任务
//author: ICONQUESTION
//version: 0.2

if (!localStorage.getItem("qietoken") || localStorage.getItem("qietoken") == 'null') {
    localStorage.setItem("qietoken", prompt("Token is not found. Please update the token below!"));
}

var token = localStorage.getItem("qietoken");
var headers = {
    "Channel": "ios_app",
    "Content-Type": "application/x-www-form-urlencoded; charset=utf-8",
    "Version": "1.33.2",
    "User-Agent": "QEUser/1.33.2 (com.qiekj.QEUser; build:1.1; iOS 17.1.0) Alamofire/5.6.4",
    "Accept-Language": "zh-Hans-CN;q=1.0",
    "Accept-Encoding": "gzip, deflate",
};
var taskActions = {
    '100001': async function (n) {
        if (!n) {
            console.error("invalid argument when calling fetchGoods");
            return;
        }

        //--------------------fetchGoods--------------------


        console.log("executing fetchGoods");

        //get item list
        await new Promise((resolve) => {
            GM_xmlhttpRequest({
                "method": "POST",
                "url": "https://qemyapi.qiekj.com/api/search_item_list",
                "headers": headers,
                "anonymous": true,
                "response": "json",
                "data": "keyWord=%e9%9b%b6%e9%a3%9f&page=1&pageSize=20",
                "onload": async function (response) {
                    try {
                        console.log(JSON.parse(response.response));
                        var data = JSON.parse(response.response);
                        if (response.status != 200 || data.code != 0 || !data.data) throw ("error when executing fetchGoods");

                        for (var i = 0; i < n; i++) {
                            //do task
                            console.log("viewGoods count " + (i + 1) + ", total " + n);

                            //randomly select one of the item_ids
                            var item = data.data.data[Math.trunc(Math.random() * data.data.data.length)], itemid = item.item_id;
                            console.log(item);

                            /*
                            example:
                            {"code":0,"msg":"成功","data":null,"t":1698674306364}
                            */

                            await new Promise((resolve) => {
                                GM_xmlhttpRequest({
                                    "method": "POST",
                                    "url": "https://userapi.qiekj.com/integralUmp/rewardIntegral",
                                    "headers": headers,
                                    "anonymous": true,
                                    "data": "itemCode=" + itemid + "&token=" + token,
                                    "responseType": "json",
                                    "onload": function (response) {
                                        try {
                                            if (response.status != 200 || response.response.code != 0 || !response.response.msg) {
                                                n = 0;
                                                throw (response.response);
                                            }
                                            console.log("viewGoods msg: " + response.response.msg);
                                            resolve();
                                        } catch (error) {
                                            console.error("error when executing viewGoods");
                                            console.log(error);
                                            return;
                                        };
                                    }
                                });
                            })
                            await sleep(15000 + Math.random() * 5000);
                        }
                        resolve();
                    } catch (error) {
                        console.error("error when executing fetchGoods");
                        console.log(error);
                        return;
                    }
                }
            });
        });
    },
    '100002': async function (n) {
        if (!n) {
            console.error("invalid argument when calling watchVideos");
            return;
        }

        //--------------------watchVideos--------------------

        /*
        example:
        {"code":0,"msg":"成功","data":true,"t":1698728364755}
        */

        for (var i = 0; i < n; i++) {
            console.log("watchVideos count " + i);

            await new Promise((resolve) => {
                GM_xmlhttpRequest({
                    "method": "POST",
                    "url": "https://userapi.qiekj.com/task/completed",
                    "headers": headers,
                    "anonymous": true,
                    "data": "taskType=2&token=" + token,
                    "responseType": "json",
                    "onload": function (response) {
                        try {
                            console.log(response.response);
                            if (response.status != 200 || response.response.code != 0 || !response.response.msg) {
                                n = 0;
                                throw (response.response);
                            }
                            resolve();
                        } catch (error) {
                            console.error("error in watchVideos");
                            console.log(error);
                            return;
                        }
                    },
                });
            });
            await sleep(15000 + 5000 * Math.random());
        }
    },
    '100003': async function (n) {
        if (!n) {
            console.error("invalid argument when calling payByUnionpay");
            return;
        }

        //--------------------payByUnionpay--------------------

        /*
        example:
        {"code":0,"msg":"成功","data":true,"t":1698728364755}
        */

        for (var i = 0; i < n; i++) {
            console.log("payByUnionpay count " + i);

            await new Promise((resolve) => {
                GM_xmlhttpRequest({
                    "method": "POST",
                    "url": "https://userapi.qiekj.com/task/completed",
                    "headers": headers,
                    "anonymous": true,
                    "data": "taskType=3&token=" + token,
                    "responseType": "json",
                    "onload": function (response) {
                        try {
                            console.log(response.response);
                            if (response.status != 200 || response.response.code != 0 || !response.response.msg) {
                                n = 0;
                                throw (response.response);
                            }
                            resolve();
                        } catch (error) {
                            console.error("error in watchVideos");
                            console.log(error);
                            return;
                        }
                    },
                });
            });
            await sleep(15000 + 5000 * Math.random());
        }
    },
};

async function getTaskStatus() {
    console.log("executing getTaskStatus");

    return await new Promise((resolve) => {
        GM_xmlhttpRequest({
            "method": "POST",
            "url": "https://userapi.qiekj.com/task/list",
            "headers": headers,
            "anonymous": true,
            "data": "token=" + token,
            "responseType": "json",
            "onload": async function (response) {
                try {
                    console.log(response.response);
                    if (response.status != 200 || response.response.code != 0 || !response.response.data) throw (response.response);
                    resolve(response.response.data);
                } catch (error) {
                    console.error("error when executing getTaskStatus");
                    console.log(error);
                    return;
                }
            }
        });
    });
}

async function checkSignIn() {
    //checkSignIn
    console.log("executing checkSignIn");

    GM_xmlhttpRequest({
        "method": "POST",
        "url": "https://userapi.qiekj.com/signin/signInAcList",
        "headers": headers,
        "anonymous": true,
        "data": "token=" + token,
        "responseType": "json",
        "onload": function (response) {
            console.log(response.response);
        },
        "onerror": function (error) {
            console.error(error);
        }
    });

    GM_xmlhttpRequest({
        "method": "GET",
        "url": "https://userapi.qiekj.com/integralUmp/horseRaceLamp?token=" + token,
        "headers": headers,
        "anonymous": true,
        "responseType": "json",
        "onload": function (response) {
            console.log(response.response);
        },
        "onerror": function (error) {
            console.error(error);
        }
    });

    GM_xmlhttpRequest({
        "method": "GET",
        "url": "https://userapi.qiekj.com/integralUmp/integralRankings?token=" + token,
        "headers": headers,
        "anonymous": true,
        "responseType": "json",
        "onload": function (response) {
            console.log(response.response);
        },
        "onerror": function (error) {
            console.error(error);
        }
    });

    return await new Promise((resolve) => {
        GM_xmlhttpRequest({
            "method": "POST",
            "url": "https://userapi.qiekj.com/signin/todaySignIn",
            "headers": headers,
            "anonymous": true,
            "responseType": "json",
            "data": "activityId=500001&token=" + token,
            "onload": function (response) {
                try {
                    console.log(response.response);
                    if (response.status != 200 || response.response.code != 0 || !response.response.data) throw (response.response);
                    resolve(response.response.data.isSignIn);
                }
                catch (error) {
                    console.error("error when executing checkSignIn");
                    console.log(error);
                    return;
                }
            },
        })
    })
}

async function signIn() {
    //signIn
    console.log("executing signIn");

    await new Promise((resolve) => {
        GM_xmlhttpRequest({
            "method": "POST",
            "url": "https://userapi.qiekj.com/signin/doUserSignIn",
            "headers": headers,
            "anonymous": true,
            "responseType": "json",
            "data": "activityId=500001&token=" + token,
            "onload": function (response) {
                try {
                    console.log(response.response);
                    if (response.status != 200 || response.response.code != 0 || !response.response.data) throw (response.response);
                    resolve();
                } catch (error) {
                    console.error("error when executing signIn");
                    console.log(error);
                    return;
                }
            },
        });
    });
}

async function getTotalIntegral() {
    console.log("executing getTotalIntegral");

    /*
    example:
    {"code":0,"msg":"成功","data":15,"t":1698728169435}
    */

    return await new Promise((resolve) => {
        GM_xmlhttpRequest({
            "method": "POST",
            "url": "https://userapi.qiekj.com/signin/getTotalIntegral",
            "headers": headers,
            "anonymous": true,
            "responseType": "json",
            "data": "token=" + token,
            "onload": function (response) {
                try {
                    console.log(response.response);
                    if (response.status != 200 || response.response.code != 0 || response.response.data === undefined) throw (response.response);
                    resolve(response.response.data);
                } catch (error) {
                    console.error("error when executing getTotalIntegral");
                    console.log(error);
                    return;
                }
            }
        })
    })

}

async function deepfake() {
    //Used to simulate user interaction with the app
    console.log("executing deepfake()");

    GM_xmlhttpRequest({
        "method": "GET",
        "url": "https://qemyapi.qiekj.com/item_category/list",
        "headers": {
            "User-Agent": "QEUser/1.34.0 (com.qiekj.QEUser; build:3; iOS 17.1.0) Alamofire/5.6.4",
            "Accept-Language": "zh-Hans-CN;q=1.0",
            "Accept": "*/*",
            "Accept-Encoding": "gzip, deflate, br",
        },
        "anonymous": true,
        "responseType": "json",
        "onload": function (response) {
            console.log(response.response);
        },
        "onerror": function (error) {
            console.error(error);
        }
    })

    GM_xmlhttpRequest({
        "method": "POST",
        "url": "https://userapi.qiekj.com/common/version",
        "headers": headers,
        "anonymous": true,
        "responseType": "json",
        "data": "plat=1&token=" + token + "&ver=1.34.0",
        "onload": function (response) {
            console.log(response.response);
        },
        "onerror": function (error) {
            console.error(error);
        }
    })

    GM_xmlhttpRequest({
        "method": "POST",
        "url": "https://userapi.qiekj.com/slot/get",
        "headers": headers,
        "anonymous": true,
        "responseType": "json",
        "data": "slotKey=ios_new_home_right_ad&token=" + token,
        "onload": function (response) {
            console.log(response.response);
        },
        "onerror": function (error) {
            console.error(error);
        }
    });

    GM_xmlhttpRequest({
        "method": "POST",
        "url": "https://userapi.qiekj.com/slot/get",
        "headers": headers,
        "anonymous": true,
        "responseType": "json",
        "data": "slotKey=ios_hot_open_screen_ad_new&token=" + token,
        "onload": function (response) {
            console.log(response.response);
        },
        "onerror": function (error) {
            console.error(error);
        }
    });

    GM_xmlhttpRequest({
        "method": "POST",
        "url": "https://userapi.qiekj.com/slot/get",
        "headers": headers,
        "anonymous": true,
        "responseType": "json",
        "data": "slotKey=ios_new_home_fence_left_a&token=" + token,
        "onload": function (response) {
            console.log(response.response);
        },
        "onerror": function (error) {
            console.error(error);
        }
    });

    GM_xmlhttpRequest({
        "method": "POST",
        "url": "https://userapi.qiekj.com/appTitle/get",
        "headers": headers,
        "anonymous": true,
        "responseType": "json",
        "data": "titleMark=point&token=" + token,
        "onload": function (response) {
            console.log(response.response);
        },
        "onerror": function (error) {
            console.error(error);
        }
    });

    GM_xmlhttpRequest({
        "method": "POST",
        "url": "https://userapi.qiekj.com/message/index/list",
        "headers": headers,
        "anonymous": true,
        "responseType": "json",
        "data": "subtypeId=5&token=" + token,
        "onload": function (response) {
            console.log(response.response);
        },
        "onerror": function (error) {
            console.error(error);
        }
    });

    GM_xmlhttpRequest({
        "method": "POST",
        "url": "https://userapi.qiekj.com/message/notRead/count",
        "headers": headers,
        "anonymous": true,
        "responseType": "json",
        "data": "type=2&token=" + token,
        "onload": function (response) {
            console.log(response.response);
        },
        "onerror": function (error) {
            console.error(error);
        }
    });

    GM_xmlhttpRequest({
        "method": "POST",
        "url": "https://userapi.qiekj.com/common/image",
        "headers": headers,
        "anonymous": true,
        "data": "code=bottom-central-gif&token=" + token,
        "responseType": "json",
        "onload": function (response) {
            console.log(response.response);
        },
        "onerror": function (error) {
            console.error(error);
        }
    });

    GM_xmlhttpRequest({
        "method": "POST",
        "url": "https://qemyapi.qiekj.com/api/item_list",
        "headers": headers,
        "anonymous": true,
        "data": "categoryCode=&page=1&pageSize=20&showLocations=1",
        "responseType": "json",
        "onload": function (response) {
            console.log(response.response);
        },
        "onerror": function (error) {
            console.error(error);
        }
    });

    GM_xmlhttpRequest({
        "method": "POST",
        "url": "https://userapi.qiekj.com/cloud/card/list/v2",
        "headers": headers,
        "anonymous": true,
        "data": "pageNum=1&pageSize=20&token=" + token,
        "responseType": "json",
        "onload": function (response) {
            console.log(response.response);
        },
        "onerror": function (error) {
            console.error(error);
        }
    });

    GM_xmlhttpRequest({
        "method": "POST",
        "url": "https://userapi.qiekj.com/user/balance",
        "headers": headers,
        "anonymous": true,
        "data": "token=" + token,
        "responseType": "json",
        "onload": function (response) {
            console.log(response.response);
        },
        "onerror": function (error) {
            console.error(error);
        }
    });

    return await new Promise((resolve) => {
        GM_xmlhttpRequest({
            "method": "POST",
            "url": "https://userapi.qiekj.com/user/info",
            "headers": headers,
            "anonymous": true,
            "data": "token=" + token,
            "responseType": "json",
            "onload": async function (response) {
                console.log(response.response);
                await sleep(2000 + Math.random() * 1000);
                resolve();
            },
            "onerror": function (error) {
                console.error(error);
            }
        });
    })
}

function sleep(time) {
    console.log("Sleep for " + time + " ms");
    return new Promise((resolve) => setTimeout(resolve, time));
}

//--------------------main--------------------

var isFinished = document.cookie.replace(
    /(?:(?:^|.*;\s*)isFinished\s*\=\s*([^;]*).*$)|^.*$/,
    "$1",
);

if (!isFinished) {
    console.log("token: " + token);
    if (!token || token == "null") {
        console.error("No token available");
        return;
    }

    //start working!
    await deepfake();
    if (!await checkSignIn()) signIn(); else console.log("Already signed in today.");

    var data = await getTaskStatus();
    for (var i = 0; i < data.items.length; i++) {
        console.log("Checking task " + (i + 1));
        console.log(data.items[i]);
        if (!data.items[i].completedStatus && taskActions[data.items[i].id]) {
            await taskActions[data.items[i].id](data.items[i].dailyTaskLimit);
            console.log("Total points: " + await getTotalIntegral());
        } else {
            console.log("Task " + (i + 1) + " has been finished");
        }
    }
    var a = new Date();
    a.setHours(24, 0, 0, 0);
    document.cookie = "isFinished=1; expires=" + a.toUTCString();
}

console.log("All tasks have been finished! \nTotal points: " + await getTotalIntegral());


