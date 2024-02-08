main();

function main() {
    checkAllCourses();
}

function checkInterestedCourses() {
    // get all wanted courses
    var list = localStorage.getItem("courses");

    if (!list) {
        console.log("No wanted course. Exit");
        return;
    }

    // monitor courses avalibility
    var handle = setInterval(function () {
        list.forEach(element => {
            GM_xmlhttpRequest({
                "method": "POST",
                "url": "https://bkzhjx.wh.sdu.edu.cn/jsxsd/xsxkkc/xsxkGgxxkxk?kcxx=" + element + "&skls=&skxq=&skjc=&sfym=false&sfct=false&szjylb=&sfxx=true&skfs=&xqid=",
                "data": "sEcho=1&iColumns=16&sColumns=&iDisplayStart=0&iDisplayLength=10&mDataProp_0=kch&mDataProp_1=kcmc&mDataProp_2=kxhnew&mDataProp_3=dwmc&mDataProp_4=jkfs&mDataProp_5=xmmc&mDataProp_6=xf&mDataProp_7=skls&mDataProp_8=sksj&mDataProp_9=skdd&mDataProp_10=xqmc&mDataProp_11=xkrs&mDataProp_12=syrs&mDataProp_13=ctsm&mDataProp_14=szkcflmc&mDataProp_15=czOper",
                "nocache": true,
                "responseType": "json",
                "onload": function (response) {
                    if (!response.response || !response.response.aaData || !response.response.aaData[0].syrs || !response.response.aaData[0].kcmc) {
                        console.log("Responsed data contains error. Exit");
                        clearInterval(handle);
                        return;
                    }
                    if (response.response.aaData[0].syrs != "0") {
                        new Notification("Course " + response.response.aaData[0].kcmc + "(" + element + ") is avaliable now. Left seats: " + response.response.aaData[0].syrs);
                    }
                },
            });
        });

    }, Math.random() * 10000 + 20000);
}

function checkAllCourses() {
    // monitor courses avalibility
    console.log("checking all courses...");
    var handle = setInterval(function () {
        console.log("current time: " + new Date().getTime());
        GM_xmlhttpRequest({
            "method": "POST",
            "url": "https://bkzhjx.wh.sdu.edu.cn/jsxsd/xsxkkc/xsxkGgxxkxk?kcxx=&skls=&skxq=&skjc=&sfym=false&sfct=false&szjylb=&sfxx=true&skfs=&xqid=",
            "headers": { "Content-Type": "application/x-www-form-urlencoded; charset=UTF-8", },
            "data": "sEcho=1&iColumns=16&sColumns=&iDisplayStart=0&iDisplayLength=300&mDataProp_0=kch&mDataProp_1=kcmc&mDataProp_2=kxhnew&mDataProp_3=dwmc&mDataProp_4=jkfs&mDataProp_5=xmmc&mDataProp_6=xf&mDataProp_7=skls&mDataProp_8=sksj&mDataProp_9=skdd&mDataProp_10=xqmc&mDataProp_11=xkrs&mDataProp_12=syrs&mDataProp_13=ctsm&mDataProp_14=szkcflmc&mDataProp_15=czOper",
            "nocache": true,
            "responseType": "json",
            "onload": function (response) {
                if (!response.response || !response.response.aaData) {
                    console.log("Responsed data contains error. Exit");
                    clearInterval(handle);
                    return;
                }

                var data = response.response.aaData;
                console.log("total course number: " + data.length);

                var notificationdata = "";
                data.forEach(element => {
                    console.log("course: " + element.kcmc + " , course availability: " + element.syrs);
                    if (element.syrs < 5 && element.syrs != 0) {
                        notificationdata += element.kcmc + "(" + element.kch + ") is avaliable now. Left: " + element.syrs + "\n";
                    }
                });
                if (notificationdata) 
                {
                    new Notification(notificationdata);
                    console.warn(notificationdata);
                }

            },
        });

    }, Math.random() * 10000 + 20000);
}
