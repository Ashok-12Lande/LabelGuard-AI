// ======================================================
// LABELGUARD AI - FRONTEND
// Camera + Upload + OCR Analysis
// ======================================================


// ======================================================
// ELEMENTS
// ======================================================

const cameraButton =
    document.getElementById("cameraButton");

const uploadButton =
    document.getElementById("uploadButton");

const fileInput =
    document.getElementById("fileInput");

const cameraBox =
    document.getElementById("cameraBox");

const cameraVideo =
    document.getElementById("cameraVideo");

const captureButton =
    document.getElementById("captureButton");

const closeCameraButton =
    document.getElementById("closeCameraButton");

const previewBox =
    document.getElementById("previewBox");

const previewImage =
    document.getElementById("previewImage");

const analyzeButton =
    document.getElementById("analyzeButton");

const loadingBox =
    document.getElementById("loadingBox");

const resultBox =
    document.getElementById("resultBox");

const errorBox =
    document.getElementById("errorBox");

const statusResult =
    document.getElementById("statusResult");

const productInfo =
    document.getElementById("productInfo");

const complianceInfo =
    document.getElementById("complianceInfo");

const ocrText =
    document.getElementById("ocrText");


// ======================================================
// VARIABLES
// ======================================================

let cameraStream = null;

let selectedImage = null;


// ======================================================
// CAMERA BUTTON
// ======================================================

cameraButton.addEventListener(
    "click",
    startCamera
);


// ======================================================
// START CAMERA
// ======================================================

async function startCamera() {

    hideError();

    try {

        if (!navigator.mediaDevices ||
            !navigator.mediaDevices.getUserMedia) {

            showError(
                "Camera is not supported by this browser."
            );

            return;
        }


        // Stop previous camera

        stopCamera();


        // Try rear camera first

        try {

            cameraStream =
                await navigator.mediaDevices.getUserMedia({

                    video: {
                        facingMode: {
                            ideal: "environment"
                        }
                    },

                    audio: false

                });

        }

        catch (error) {

            console.log(
                "Rear camera unavailable. Trying default camera..."
            );


            cameraStream =
                await navigator.mediaDevices.getUserMedia({

                    video: true,

                    audio: false

                });

        }


        cameraVideo.srcObject =
            cameraStream;


        cameraBox.style.display =
            "block";


        previewBox.style.display =
            "none";


        resultBox.style.display =
            "none";


        await cameraVideo.play();

    }

    catch (error) {

        console.error(
            "Camera Error:",
            error
        );


        showError(
            "Camera could not be opened. Please allow camera permission in your browser and try again."
        );

    }

}


// ======================================================
// CAPTURE IMAGE
// ======================================================

captureButton.addEventListener(
    "click",
    captureImage
);


function captureImage() {

    if (!cameraStream) {

        showError(
            "Camera is not running."
        );

        return;
    }


    const videoWidth =
        cameraVideo.videoWidth;

    const videoHeight =
        cameraVideo.videoHeight;


    if (!videoWidth || !videoHeight) {

        showError(
            "Camera image is not ready yet. Please wait a moment."
        );

        return;
    }


    const canvas =
        document.createElement("canvas");


    canvas.width =
        videoWidth;

    canvas.height =
        videoHeight;


    const context =
        canvas.getContext("2d");


    context.drawImage(
        cameraVideo,
        0,
        0,
        videoWidth,
        videoHeight
    );


    canvas.toBlob(

        function (blob) {

            if (!blob) {

                showError(
                    "Could not capture the camera image."
                );

                return;
            }


            selectedImage =
                new File(
                    [blob],
                    "camera-product.jpg",
                    {
                        type: "image/jpeg"
                    }
                );


            previewImage.src =
                URL.createObjectURL(
                    selectedImage
                );


            previewBox.style.display =
                "block";


            resultBox.style.display =
                "none";


            stopCamera();

        },

        "image/jpeg",

        0.90

    );

}


// ======================================================
// CLOSE CAMERA
// ======================================================

closeCameraButton.addEventListener(
    "click",
    function () {

        stopCamera();

        cameraBox.style.display =
            "none";

    }
);


// ======================================================
// STOP CAMERA
// ======================================================

function stopCamera() {

    if (cameraStream) {

        cameraStream
            .getTracks()
            .forEach(
                track => track.stop()
            );

        cameraStream = null;

    }


    cameraVideo.srcObject =
        null;

}


// ======================================================
// UPLOAD BUTTON
// ======================================================

uploadButton.addEventListener(
    "click",
    function () {

        fileInput.click();

    }
);


// ======================================================
// FILE SELECTED
// ======================================================

fileInput.addEventListener(
    "change",
    function () {

        const file =
            fileInput.files[0];


        if (!file) {
            return;
        }


        if (!file.type.startsWith("image/")) {

            showError(
                "Please select an image file."
            );

            return;
        }


        selectedImage =
            file;


        previewImage.src =
            URL.createObjectURL(
                file
            );


        previewBox.style.display =
            "block";


        resultBox.style.display =
            "none";


        hideError();

    }
);


// ======================================================
// ANALYZE BUTTON
// ======================================================

analyzeButton.addEventListener(
    "click",
    analyzeProduct
);


// ======================================================
// ANALYZE PRODUCT
// ======================================================

async function analyzeProduct() {

    hideError();


    if (!selectedImage) {

        showError(
            "Please capture or upload a product image first."
        );

        return;
    }


    // Show loading

    loadingBox.style.display =
        "block";


    resultBox.style.display =
        "none";


    analyzeButton.disabled =
        true;


    try {

        console.log(
            "Sending image to Vercel API..."
        );


        const formData =
            new FormData();


        formData.append(
            "productImage",
            selectedImage
        );


        // ==================================================
        // VERCEL API
        // ==================================================

        const response =
            await fetch(
                "/api/analyze",
                {
                    method: "POST",
                    body: formData
                }
            );


        console.log(
            "API status:",
            response.status
        );


        // Get response as TEXT first

        // This prevents:
        // Unexpected end of JSON input

        const responseText =
            await response.text();


        console.log(
            "API response:",
            responseText
        );


        let data;


        try {

            data =
                JSON.parse(
                    responseText
                );

        }

        catch (jsonError) {

            throw new Error(
                "Server returned an invalid response. HTTP " +
                response.status +
                ": " +
                responseText.substring(
                    0,
                    500
                )
            );

        }


        if (!response.ok) {

            throw new Error(
                data.message ||
                data.error ||
                "Server analysis failed."
            );

        }


        if (!data.success) {

            throw new Error(
                data.message ||
                "Product analysis failed."
            );

        }


        // ==================================================
        // DISPLAY COMPLETE RESULT
        // ==================================================

        displayResult(
            data
        );


    }

    catch (error) {

        console.error(
            "Analysis Error:",
            error
        );


        showError(
            error.message
        );

    }

    finally {

        loadingBox.style.display =
            "none";


        analyzeButton.disabled =
            false;

    }

}


// ======================================================
// DISPLAY RESULT
// ======================================================

function displayResult(data) {

    resultBox.style.display =
        "block";


    // ==================================================
    // STATUS
    // ==================================================

    statusResult.innerHTML = `
        <strong>✅ Analysis Completed</strong>
        <br>
        ${escapeHTML(
            data.message ||
            "Product analyzed successfully."
        )}
    `;


    // ==================================================
    // PRODUCT INFORMATION
    // ==================================================

    const info =
        data.productInfo;


    if (info &&
        typeof info === "object") {

        productInfo.innerHTML =
            createObjectHTML(
                info
            );

    }

    else {

        productInfo.innerHTML =
            "<p>No product information returned.</p>";

    }


    // ==================================================
    // COMPLIANCE
    // ==================================================

    const compliance =
        data.compliance;


    if (compliance &&
        typeof compliance === "object") {

        complianceInfo.innerHTML =
            createObjectHTML(
                compliance
            );

    }

    else {

        complianceInfo.innerHTML =
            "<p>No compliance result returned.</p>";

    }


    // ==================================================
    // OCR TEXT
    // ==================================================

    ocrText.textContent =
        data.text ||
        "No OCR text returned.";


    // Scroll to result

    resultBox.scrollIntoView({
        behavior: "smooth",
        block: "start"
    });

}


// ======================================================
// CREATE OBJECT HTML
// ======================================================

function createObjectHTML(object) {

    let html =
        "<div>";


    for (
        const [key, value]
        of Object.entries(object)
    ) {

        let displayValue;


        if (
            value !== null &&
            typeof value === "object"
        ) {

            displayValue =
                createObjectHTML(
                    value
                );

        }

        else {

            displayValue =
                escapeHTML(
                    String(
                        value ??
                        "Not detected"
                    )
                );

        }


        html += `

            <div
                style="
                    padding:10px 0;
                    border-bottom:1px solid rgba(255,255,255,0.12);
                "
            >

                <strong>
                    ${escapeHTML(
                        formatKey(key)
                    )}
                </strong>

                :

                ${displayValue}

            </div>

        `;

    }


    html +=
        "</div>";


    return html;

}


// ======================================================
// FORMAT KEY
// ======================================================

function formatKey(key) {

    return String(key)
        .replace(/([A-Z])/g, " $1")
        .replace(/[_-]/g, " ")
        .replace(
            /^./,
            char => char.toUpperCase()
        );

}


// ======================================================
// ESCAPE HTML
// ======================================================

function escapeHTML(value) {

    return String(value)
        .replace(
            /&/g,
            "&amp;"
        )
        .replace(
            /</g,
            "&lt;"
        )
        .replace(
            />/g,
            "&gt;"
        )
        .replace(
            /"/g,
            "&quot;"
        )
        .replace(
            /'/g,
            "&#039;"
        );

}


// ======================================================
// ERROR
// ======================================================

function showError(message) {

    errorBox.textContent =
        "❌ " + message;


    errorBox.style.display =
        "block";


    resultBox.style.display =
        "none";

}


// ======================================================
// HIDE ERROR
// ======================================================

function hideError() {

    errorBox.style.display =
        "none";

}


// ======================================================
// PAGE EXIT
// ======================================================

window.addEventListener(
    "beforeunload",
    stopCamera
);