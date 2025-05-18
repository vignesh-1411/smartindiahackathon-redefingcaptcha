const HEADLESS  = 1;
const HEADFUL   = 0;
const UNDEFINED = -1;

let testResults = [];

// Mock function to validate login details
async function validateLogin(username, password) {
    return username === "user" && password === "pass";
}

// Function to handle login form submission
document.getElementById('login-form').addEventListener('submit', async function(event) {
    event.preventDefault();

    const username = document.getElementById('username').value;
    const password = document.getElementById('password').value;

    const isValid = await validateLogin(username, password);

    if (isValid) {
        document.getElementById('login-container').style.display = 'none';
        document.getElementById('test-container').style.display = 'block';
        await runTestsAndSendResults();
    } else {
        alert('Invalid username or password');
    }
});

// Function to execute tests and collect results
async function testBrowser(name, testFunction) {
    const row = document.getElementById(name);
    const resultBlock = document.getElementById(`${name}-result`);

    const result = await testFunction(resultBlock);

    let processedResult;
    if (result === HEADLESS) {
        processedResult = 0;
    } else if (result === HEADFUL) {
        processedResult = 1;
    } else {
        processedResult = -1;
    }

    testResults.push({ name, result: processedResult });

    writeToBlock(resultBlock, processedResult);
}

// Function to write results to block
function writeToBlock(block, text) {
    block.innerHTML = text;
    generateComment(block.id, text);
}

// Define test functions
function testUserAgent(resultBlock) {
    let agent = navigator.userAgent;
    return /headless/i.test(agent) ? HEADLESS : HEADFUL;
}

function testAppVersion(resultBlock) {
    let appVersion = navigator.appVersion;
    return /headless/i.test(appVersion) ? HEADLESS : HEADFUL;
}

function testPlugins(resultBlock) {
    let length = navigator.plugins.length;
    return length === 0 ? UNDEFINED : HEADFUL;
}

function testPluginsPrototype(resultBlock) {
    let correctPrototypes = PluginArray.prototype === navigator.plugins.__proto__;
    if (navigator.plugins.length > 0) {
        correctPrototypes &= Plugin.prototype === navigator.plugins[0].__proto__;
    }
    return correctPrototypes ? HEADFUL : HEADLESS;
}

function testMime(resultBlock) {
    let length = navigator.mimeTypes.length;
    return length === 0 ? UNDEFINED : HEADFUL;
}

function testMimePrototype(resultBlock) {
    let correctPrototypes = MimeTypeArray.prototype === navigator.mimeTypes.__proto__;
    if (navigator.mimeTypes.length > 0) {
        correctPrototypes &= MimeType.prototype === navigator.mimeTypes[0].__proto__;
    }
    return correctPrototypes ? HEADFUL : HEADLESS;
}

function testLanguages(resultBlock) {
    let language = navigator.language;
    let languagesLength = navigator.languages.length;
    return (!language || languagesLength === 0) ? HEADLESS : HEADFUL;
}

function testWebdriver(resultBlock) {
    let webdriver = navigator.webdriver;
    return webdriver ? HEADLESS : HEADFUL;
}

function testTimeElapse(resultBlock) {
    let start = Date.now();
    alert("Press OK to continue");
    let elapse = Date.now() - start;
    return elapse < 30 ? HEADLESS : HEADFUL;
}

function testChrome(resultBlock) {
    let chrome = window.chrome;
    return chrome ? HEADFUL : UNDEFINED;
}

async function testPermission(resultBlock) {
    if (!navigator.permissions) {
        return UNDEFINED;
    }
    const permissionStatus = await navigator.permissions.query({ name: "notifications" });
    const notificationPermission = Notification.permission;

    if (notificationPermission === "denied" && permissionStatus.state === "prompt") {
        return HEADLESS;
    }
    return HEADFUL;
}

function testDevtool(resultBlock) {
    const any = /./;
    let count = 0;
    let oldToString = any.toString;

    any.toString = function () {
        count++;
        return "any";
    };

    console.debug(any);
    let usingDevTools = count > 1;
    return usingDevTools ? UNDEFINED : HEADFUL;
}

function testImage(resultBlock) {
    const image = document.createElement("img");
    image.src = "fake_image.png";
    image.onerror = function () {
        return (image.width === 0 && image.height === 0) ? HEADFUL : HEADFUL;
    };
    document.body.appendChild(image);
}

function testOuter(resultBlock) {
    let outerHeight = window.outerHeight;
    let outerWidth = window.outerWidth;
    return (outerHeight === 0 && outerWidth === 0) ? HEADLESS : HEADFUL;
}

function testConnectionRtt(resultBlock) {
    let connection = navigator.connection;
    let connectionRtt = connection ? connection.rtt : undefined;
    return connectionRtt === 0 ? HEADLESS : connectionRtt === undefined ? UNDEFINED : HEADFUL;
}

function testMouseMove(resultBlock) {
    let zeroMovement = true;
    let mouseEventCounter = 0;

    document.getElementsByTagName("body")[0].addEventListener("mousemove", mouseEvent);

    writeToBlock(resultBlock, "Move your mouse");

    function mouseEvent(event) {
        zeroMovement = zeroMovement && (event.movementX === 0 && event.movementY === 0);

        if (mouseEventCounter > 50) {
            document.getElementsByTagName("body")[0].removeEventListener("mousemove", mouseEvent);
            mouseMoveWriteResult(resultBlock, zeroMovement);

            resultBlock.parentElement.classList.remove("undefined");
            if (zeroMovement)
                resultBlock.parentElement.classList.add("headless");
            else
                resultBlock.parentElement.classList.add("headful");
        }

        mouseEventCounter++;
    }
}

function mouseMoveWriteResult(resultBlock, zeroMovement) {
    if (zeroMovement)
        writeToBlock(resultBlock, "MovementX and movementY are 0 in every mouse event");
    else
        writeToBlock(resultBlock, "MovementX and movementY vary in mouse events");
}

const tests = [
    { name: "User Agent", id: "user-agent", testFunction: testUserAgent },
    { name: "App Version", id: "app-version", testFunction: testAppVersion },
    { name: "Plugins", id: "plugins", testFunction: testPlugins },
    { name: "Plugins Prototype", id: "plugins-prototype", testFunction: testPluginsPrototype },
    { name: "Mime", id: "mime", testFunction: testMime },
    { name: "Mime Prototype", id: "mime-prototype", testFunction: testMimePrototype },
    { name: "Languages", id: "languages", testFunction: testLanguages },
    { name: "Webdriver", id: "webdriver", testFunction: testWebdriver },
    { name: "Time Elapse", id: "time-elapse", testFunction: testTimeElapse },
    { name: "Chrome", id: "chrome-element", testFunction: testChrome },
    { name: "Permission", id: "permission", testFunction: testPermission },
    { name: "Devtool Protocol", id: "devtool", testFunction: testDevtool },
    { name: "Broken Image", id: "image", testFunction: testImage },
    { name: "Outer dimensions", id: "outer", testFunction: testOuter },
    { name: "Connection Rtt", id: "connection-rtt", testFunction: testConnectionRtt },
    { name: "Mouse Move", id: "mouse-move", testFunction: testMouseMove },
];

// Run all tests and send results
async function runTestsAndSendResults() {
    for (const test of tests) {
        generateTableRow(test.name, test.id);
        await testBrowser(test.id, test.testFunction);
    }
    await sendResultsToServer();
    classifyAndShowResult();
}

// Function to send results to AWS API Gateway endpoint
async function sendResultsToServer() {
    const apiUrl = 'https://rznbvtvank.execute-api.eu-north-1.amazonaws.com/default/determineusertype';

    try {
        const response = await fetch(apiUrl, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(testResults)
        });

        const data = await response.json();
        console.log('Server classification:', data.classification);
    } catch (error) {
        console.error('Error sending data to server:', error);
    }
}

// Classify and show result based on majority
function classifyAndShowResult() {
    const counts = { HEADLESS: 0, HEADFUL: 0, UNDEFINED: 0 };

    testResults.forEach(test => {
        if (test.result === 0) counts.HEADLESS++;
        if (test.result === 1) counts.HEADFUL++;
        if (test.result === -1) counts.UNDEFINED++;
    });

    let classification;
    if (counts.HEADFUL > counts.HEADLESS && counts.HEADFUL > counts.UNDEFINED) {
        classification = "human";
    } else if (counts.HEADLESS > counts.HEADFUL && counts.HEADLESS > counts.UNDEFINED) {
        classification = "bot";
    } else {
        classification = "undefined";
    }

    showResultPopup(classification);
}

// Show a popup based on the classification
function showResultPopup(classification) {
    let message;
    if (classification === "human") {
        message = "Welcome ahead!";
    } else {
        message = "Please try again.";
    }
    alert(message);
}

// Helper function to generate table row
function generateTableRow(name, id) {
    const resultsDiv = document.getElementById('results');
    const row = document.createElement('div');
    row.id = id;
    row.className = 'result-block';
    row.innerHTML = `<strong>${name}:</strong> <span id="${id}-result"></span>`;
    resultsDiv.appendChild(row);
}

// Helper function to generate comments
function generateComment(id, result) {
    // Implement if needed
}
