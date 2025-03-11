// ==UserScript==
// @name         Discord Equalizer
// @namespace    http://tampermonkey.net/
// @version      1.2
// @description  ilikepenis
// @match        https://discord.com/*
// @grant        none
// @run-at       document-start
// ==/UserScript==

(function() {
    'use strict';
    const processAudioStream = (stream) => {
        const audioContext = new AudioContext();
        const source = audioContext.createMediaStreamSource(stream);
        const destination = audioContext.createMediaStreamDestination();
        const eq = audioContext.createBiquadFilter();
        const gain = audioContext.createGain();
        eq.type = 'peaking';
        eq.frequency.value = 1800;
        eq.Q.value = 1.0;
        eq.gain.value = 0.0;
        gain.gain.value = 5.0;
        source.connect(eq);
        eq.connect(gain);
        gain.connect(destination);
        const processedStream = destination.stream;
        processedStream.getAudioTracks().forEach(track => {
            track.enabled = stream.getAudioTracks()[0].enabled;
        });

        return processedStream;
    };
    const originalGetUserMedia = navigator.mediaDevices.getUserMedia.bind(navigator.mediaDevices);

    navigator.mediaDevices.getUserMedia = async function(constraints) {
        const stream = await originalGetUserMedia(constraints);
        return constraints.audio ? processAudioStream(stream) : stream;
    };

    const observer = new MutationObserver(() => {
        if (document.querySelector('[aria-label*="Voice Connected"]')) {
            navigator.mediaDevices.getUserMedia({ audio: true, video: false });
        }
    });

    observer.observe(document.body, { childList: true, subtree: true });
})();
