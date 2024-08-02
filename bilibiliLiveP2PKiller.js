// ==UserScript==
// @name         Bilibili LiveP2P Killer
// @namespace    http://tampermonkey.net/
// @version      0.1
// @description  Block Bilibili Livestreaming P2P Upload
// @author       ICONQUESTION
// @match        https://live.bilibili.com/*
// @icon         https://www.bilibili.com/favicon.ico
// @grant        none
// ==/UserScript==

delete window.RTCPeerConnection;
delete window.mozRTCPeerConnection;
delete window.webkitRTCPeerConnection;
