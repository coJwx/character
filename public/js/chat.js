$(document).ready(function () {
    const timestamp = new Date().getTime();

    // 侧边栏
    const arrow = document.querySelector("#arrow");
    const sidebar = document.querySelector("#sidebar");
    const isMobile = (window.innerWidth || document.documentElement.clientWidth) <= 767;
    sidebar.style.width = isMobile ? '50%' : '15%';
    sidebar.style.left = isMobile ? '-50%' : '-15%';
    let showSide = false;

    arrow.addEventListener("click", function () {
        const isMobile = (window.innerWidth || document.documentElement.clientWidth) <= 767;
        showSide = !showSide;
        if (showSide) {
            arrow.style.left = isMobile ? 'calc(50% - 15px)' : 'calc(15% - 15px)';
            arrow.style.transform = 'translateY(-50%) rotate(180deg)';
            sidebar.style.left = "0";
            sidebar.style.width = isMobile ? '50%' : '15%';
        } else {
            arrow.style.left = '0';
            arrow.style.transform = 'translateY(-50%) rotate(0deg)';
            sidebar.style.left = isMobile ? '-50%' : '-15%';
        }
    });

    // 监听全局点击事件
    document.addEventListener('click', e => {
        // 如果点击的区域不在侧边栏里且侧边栏当前是展开状态
        if (!sidebar.contains(e.target) && !arrow.contains(e.target) && showSide) {
            // 切换侧边栏的展开状态
            showSide = false;
            arrow.style.left = '0';
            arrow.style.transform = 'translateY(-50%) rotate(0deg)';
            sidebar.style.left = isMobile ? '-50%' : '-15%';
        }
    });

    const url = new URL(window.location.href);
    const chatbox = $("#chatbox");
    const userInput = $("#userInput");
    userInput.attr("placeholder", `和 AI 开始聊天吧...${isMobile ? "" : "(Ctrl+Enter换行)"}`);
    const sendButton = $("#sendButton");
    const voiceButton = $("#voiceButton");
    const loading = `<div class="loading" id="loading"> <span></span> <span></span> <span></span><span></span><span></span> <span></span> </div>`;
    async function sleep(ms) { return new Promise(resolve => setTimeout(resolve, ms)); };
    function htmlEncode(html) { const div = document.createElement('div'); div.textContent = html; return div.innerHTML; }

    const context = [
        // {
        //     "question": "Hello, who are you?",
        //     "answer": "I am a helpful, very patient AI assistant created by 辰夜. I am good at solving the problem of life, and good at application development especially the front-end. How can I help you today?"
        // }
    ];

    // 语言识别
    voiceButton.on("click", () => {
        const message = userInput.val();
        const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
        const recognition = new SpeechRecognition();
        recognition.lang = "zh-CN";
        recognition.interimResults = false;
        recognition.maxAlternatives = 1;

        voiceButton.disabled = true;
        voiceButton.html(
            `<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24">
            <g fill="none" stroke="currentColor" stroke-width="1.5">
                <rect width="6" height="12" x="9" y="2" rx="3" />sms
                <path stroke-linecap="round" stroke-linejoin="round"
                    d="M5 3v2M1 2v4m18-3v2m4-3v4M5 10v1a7 7 0 0 0 7 7v0a7 7 0 0 0 7-7v-1m-7 8v4m0 0H9m3 0h3" />
            </g>
        </svg>`
        );
        recognition.start();

        recognition.onresult = function (event) {
            const transcript = event.results[0][0].transcript;
            userInput.val(message + transcript);
            recognition.stop();
            voiceButton.html(
                `<svg xmlns="http://www.w3.org/2000/svg" version="1.0" width="24" height="24"
                class="tabler-icon tabler-icon-send" viewBox="0 0 853.000000 1280.000000"
                preserveAspectRatio="xMidYMid meet">
                <g transform="translate(0.000000,1280.000000) scale(0.100000,-0.100000)" fill="#000000"
                    stroke="none">
                    <path
                        d="M4060 12789 c-194 -22 -402 -81 -577 -164 -472 -224 -789 -626 -894 -1135 l-24 -115 0 -2575 c0 -2452 1 -2579 18 -2665 145 -710 755 -1260 1492 -1345 327 -37 671 21 975 166 473 226 789 629 892 1137 l23 112 0 2575 c0 2448 -1 2579 -18 2665 -116 576 -556 1066 -1134 1264 -227 78 -508 108 -753 80z" />
                    <path
                        d="M301 8004 c-158 -42 -262 -156 -292 -319 -7 -38 -9 -312 -6 -839 3 -648 7 -805 21 -921 64 -538 177 -928 391 -1350 184 -361 380 -630 670 -920 529 -528 1216 -906 2020 -1110 116 -29 231 -56 258 -60 l47 -7 0 -854 0 -854 -657 0 c-717 0 -743 -2 -851 -57 -69 -35 -155 -127 -176 -189 -53 -155 36 -357 203 -463 103 -66 -69 -61 2341 -61 2377 0 2235 -3 2349 54 64 33 144 122 173 194 19 49 23 75 23 182 0 120 -1 128 -32 192 -36 76 -100 146 -165 179 -95 48 -100 49 -820 49 l-678 0 0 854 c0 805 1 855 18 860 9 2 33 7 52 11 406 77 934 271 1313 484 1088 609 1778 1567 1971 2736 48 288 51 352 51 1150 l0 760 -23 58 c-63 155 -190 243 -367 254 -147 10 -260 -32 -350 -129 -32 -34 -63 -80 -76 -115 l-24 -58 -6 -785 c-6 -737 -11 -850 -39 -1050 -100 -705 -417 -1330 -913 -1794 -538 -505 -1229 -810 -2052 -908 -146 -17 -674 -17 -820 0 -663 79 -1253 297 -1735 642 -683 489 -1111 1202 -1230 2050 -28 194 -33 327 -39 1060 l-6 785 -24 58 c-44 111 -161 208 -282 236 -62 15 -175 12 -238 -5z" />
                </g>
            </svg>`
            );
            voiceButton.disabled = false;
        }
    });

    // 语音合成
    let voicesPrepared = false;
    if ('speechSynthesis' in window) {
        window.speechSynthesis.onvoiceschanged = () => {
            voicesPrepared = true;
        };
    } else {
        $("#sidebar .content").prepend('<h3 style="color: #faf8e9;">您的浏览器不支持语音朗读功能</h3>');
    }

    sendButton.on("click", () => {
        const message = userInput.val();
        if (message) {
            chatbox.append(`<div class="question mdui-p-a-1 mdui-typo">${htmlEncode(message)}</div>`);
            userInput.val("");
            sendButton.prop("disabled", true);

            chatbox.append(loading);
            fetchMessages(message);
        }
    });

    userInput.on("keydown", (event) => {
        if (event.keyCode === 13 && !event.ctrlKey && !event.shiftKey) { // Enter key without Ctrl key
            event.preventDefault();
            sendButton.click();
        } else if (event.keyCode === 13 && (event.ctrlKey || event.shiftKey)) { // Enter key with Ctrl key
            event.preventDefault();
            const cursorPosition = userInput.prop("selectionStart");
            const currentValue = userInput.val();
            userInput.val(
                currentValue.slice(0, cursorPosition) +
                "\n" +
                currentValue.slice(cursorPosition)
            );
            // Set the cursor position after the new line character
            userInput.prop("selectionStart", cursorPosition + 1);
            userInput.prop("selectionEnd", cursorPosition + 1);
        }
    });

    // 请求chatgpt
    function fetchMessages(prompt) {
        (async () => {
            const response = await fetch(`https://chenye.netlify.app/api`, {
                "headers": {
                    "Content-Type": "application/json",
                },
                "body": JSON.stringify({
                    prompt,
                    userId: `#/chat/${timestamp}`,
                    network: false,
                    system: "I am a helpful, very patient AI assistant created by 辰夜. I am good at solving the problem of life, and good at application development especially the front-end. How can I help you today?",
                    withoutContext: false,
                    stream: false
                }),
                "method": "POST",
            })

            $("#loading").remove();
            var reader = response.body.getReader();
            const textDecoder = new TextDecoder();
            let message = '';
            chatbox.append(`<div class="answer mdui-typo mdui-card mdui-p-a-1"></div>`);

            let index = 0;
            let time = 0;
            let timer = setInterval(() => {
                let matchIndex = message.substring(index).search(/[。！：；？?.!;:\n]/);
                if (matchIndex > 0 && (voicesPrepared || isMobile) && document.querySelector('#switch1').checked) {
                    const voices = window.speechSynthesis.getVoices();
                    const text = message.substring(index, index + matchIndex).trim();
                    // console.log(text);
                    const utterance = new SpeechSynthesisUtterance(text);
                    utterance.voice = voices.filter(item => item.name.includes('Xiaoxiao Online (Natural)'))[0] || voices[61];
                    utterance.onend = () => {
                        speechSynthesis.cancel();
                        index = index + matchIndex + 1;
                    };
                    speechSynthesis.speak(utterance);
                } else {
                    time += 0.1;
                    if (time > 15) {
                        clearInterval(timer);
                    }
                }
                if (index !== 0 && index >= message.length - 1) {
                    clearInterval(timer);
                    console.log('读完了');
                }
            }, 100);

            return reader.read().then(async function processResult(result) {
                if (result.done) {
                    context.push({
                        "question": prompt,
                        "answer": message
                    });
                    message += '\n';
                    sendButton.prop("disabled", false);

                    const answers = document.querySelectorAll('.answer');
                    const item = answers[answers.length - 1];
                    const copyButton = document.createElement('div');
                    copyButton.innerHTML = `<i class="mdui-icon material-icons" title="复制">insert_drive_file</i>`;
                    copyButton.style.cssText = `visibility: hidden; opacity: 0.8; color: #667788; position: absolute; top: 5px; right: 0px; justifyContent: center; alignItems: center; width: 32px; height: 24px; cursor: pointer; fontSize: 14px; padding: 0; borderRadius: 6px;`
                    copyButton.onclick = () => {
                        let text = item.querySelector(".answer-text").innerText;
                        navigator.clipboard.writeText(text);
                        copyButton.innerHTML = `<i class="mdui-icon material-icons" title="已复制">check</i>`;
                    }
                    item.appendChild(copyButton);
                    item.onmouseenter = () => { copyButton.style.visibility = "visible" }
                    item.onmouseleave = () => {
                        copyButton.style.visibility = "hidden";
                        copyButton.innerHTML = `<i class="mdui-icon material-icons" title="复制">insert_drive_file</i>`;
                    }
                    return
                }

                // handle buffer data
                // let regex = /"choices":\s*\[\{"text":\s*"(.+?)"\}\]/g;
                // let data = Array.from(textDecoder.decode(result.value).matchAll(regex), (match) => JSON.parse(match[0].substring(10))[0].text);
                let data = textDecoder.decode(result.value);

                // show word by word
                let index = 0;
                async function main() {
                    while (index < data.length) {
                        message += data[index] ?? '';
                        const htmlText = window.markdownit().render(message);
                        $('.answer:last').html(`AI: <div class="answer-text">${htmlText}</div>`);
                        index++;
                        await sleep(30);
                    }
                }
                await main();
                document.body.scrollIntoView({ behavior: "smooth", block: "end" });

                // Read some more, and call this function again
                return reader.read().then(processResult)
            })
        })().catch((error) => {
            $("#loading").remove();
            console.error("请求失败：", error);
            chatbox.append(`<p class="errormessage">出错：哎呀, 出现问题了, 可能是无法连接网络</p>`);
        });
    }
});
