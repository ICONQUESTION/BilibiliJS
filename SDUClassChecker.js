// ==UserScript==
// @name         SDU Class Checker
// @namespace    http://tampermonkey.net/
// @version      1.27
// @description  Help to check all available classes
// @author       ICONQUESTION
// @match        https://bkzhjx.wh.sdu.edu.cn/jsxsd/xsxk/newXsxkzx*
// @icon         https://www.sdu.edu.cn/favicon.ico
// @grant        none
// ==/UserScript==


/**
 * how to use
 * 0. Make sure you have logged in to your course selection platform.
 * 1. Enable notification privilege of the webpage you want to run this script on.
 * 2. Edit the localstorage. Add an item called favClasses and set its value to an array which contains the SN of your favorite classes, like ["000001","000002"]. 
 *    If there is any syntax error, this script will refuse to run.
 * 3. Enable this script and reload the webpage. All outputs will be displayed on console. If there is any class available, a system notification will be sent.
 */


(function () {
    // name:favClass    type:Array  content:courseSN
    // get favorite classes
    var favClasses = localStorage.getItem("favClasses");
    if (!favClasses) {
        console.warn("No favorite classes. Exit.");
        return;
    }

    try {
        favClasses = JSON.parse(favClasses);
    } catch (e) {
        console.error("JSON parse failed. Check your format.");
        return;
    }

    console.log("Favorite classes: ");
    console.log(favClasses);


    // get notification privilege
    if (Notification.permission == "default") Notification.requestPermission();
    if (Notification.permission != "granted") {
        console.log("This script needs notification privilege to function normally. Please enable notification privilege!");
        return;
    }


    // set timeout
    var timeout = localStorage.getItem("checkInterval");
    if (!timeout) timeout = 14 * 1000 + 5000 * Math.random();
    console.log("Check interval: " + timeout);


    // work
    var intervalHandle = setInterval(async () => {
        var results = [];

        for (var index = 0; index < favClasses.length; index++) {
            var element = favClasses[index];
            console.log("Checking class: " + element + " (" + (index + 1) + "/" + favClasses.length + ")");

            // request
            // "https://bkzhjx.wh.sdu.edu.cn/jsxsd/xsxkkc/xsxkGgxxkxk?kcxx=" + element + "&skls=&skxq=&skjc=&sfym=false&sfct=false&szjylb=&sfxx=false&skfs=&xqid="
            // "https://bkzhjx.wh.sdu.edu.cn/jsxsd/xsxkkc/xsxkBxxk?1=1&kcxx=" + element + "&skls=&skfs=&xqid="

            await fetch("https://bkzhjx.wh.sdu.edu.cn/jsxsd/xsxkkc/xsxkBxxk?1=1&kcxx=" + element + "&skls=&skfs=&xqid=", {
                method: "post",
                credentials: "include",
                headers: {
                    "Content-Type": "application/x-www-form-urlencoded; charset=UTF-8",
                },
                body: "sEcho=1&iColumns=16&sColumns=&iDisplayStart=0&iDisplayLength=10&mDataProp_0=kch&mDataProp_1=kcmc&mDataProp_2=kxhnew&mDataProp_3=dwmc&mDataProp_4=jkfs&mDataProp_5=xmmc&mDataProp_6=xf&mDataProp_7=skls&mDataProp_8=sksj&mDataProp_9=skdd&mDataProp_10=xqmc&mDataProp_11=xkrs&mDataProp_12=syrs&mDataProp_13=ctsm&mDataProp_14=szkcflmc&mDataProp_15=czOper"
            }).then((res) => {
                return res.json();
            }).then((data) => {
                // one courseSN may have more than one teacher(aaData.length>=1)
                if (!data || !data.aaData || !data.aaData.length) {
                    throw "Incomplete data. Check if login credential is invalid, courseSN is invalid or something else went wrong.";
                }

                data.aaData.forEach((ele) => {
                    if (ele.syrs === undefined || ele.kch === undefined || ele.kcmc === undefined || !ele.kkapList || !ele.kkapList[0].jgxm) {
                        throw "Incomplete data. Check if login credential is invalid, or something else went wrong.";
                    }

                    var newitem = { "courseName": ele.kcmc, "courseSN": ele.kch, "courseTeacher": ele.kkapList[0].jgxm, "courseVolume": ele.syrs };
                    console.log(newitem);
                    if (ele.syrs > 0) results.push(newitem);
                })
            }).catch((e) => {
                clearInterval(intervalHandle);
                index = favClasses.length;
                console.error(e);
                console.warn("Interval has been cleared. To run this scipt again, please refresh the page.");
            });

            // if this is not the last one, sleep
            if (index < favClasses.length - 1) { await sleep(3000 + 500 * Math.random()); }
        }

        if (results.length) {
            console.log("%cFavorite class is available!", "display: inline-block ; background-color: #66ccff ; color: white ; font-weight: bold ; padding: 3px 7px 3px 7px ; border-radius: 3px 3px 3px 3px ;");
            new Notification("courseInfo", {
                body: JSON.stringify(results),
            })
        } else {
            console.log("%cNo favorite class is available.", "display: inline-block ; background-color: #ffa500 ; color: white ; font-weight: bold ; padding: 3px 7px 3px 7px ; border-radius: 3px 3px 3px 3px ;");
        }
    }, timeout);


    function sleep(time) {
        console.log("Sleep for " + time + " ms");
        return new Promise((resolve) => setTimeout(resolve, time));
    }
})();

