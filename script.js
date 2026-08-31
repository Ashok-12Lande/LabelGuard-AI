// ======================================================
// LABELGUARD AI - FRONTEND
// Camera + Upload + OCR Analysis
// ======================================================

document.addEventListener("DOMContentLoaded", () => {

    // ==================================================
    // ELEMENTS
    // ==================================================

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


    // ==================================================
    // VARIABLES
    // ==================================================

    let cameraStream = null;
    let selectedImage = null;


    // ==================================================
    // CHECK ELEMENTS
    // ==================================================

    if (!cameraButton ||
        !uploadButton ||
        !fileInput ||
        !cameraBox ||
        !cameraVideo ||
        !captureButton ||
        !closeCameraButton ||
        !previewBox ||
        !previewImage ||
        !analyzeButton) {

        console.error(
            "LabelGuard AI: Required HTML elements are missing."
        );

        return;
    }


    // ==================================================
    // CAMERA BUTTON
    // ==================================================

    cameraButton.addEventListener(
        "click",
        startCamera
    );


    // ==================================================
    // START CAMERA
    // ==================================================

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


            stopCamera();


            // Request camera

            cameraStream =
                await navigator.mediaDevices.getUserMedia({

                    video: {
                        facingMode: {
                            ideal: "environment"
                        },

                        width: {
                            ideal: 1280
                        },

                        height: {
                            ideal: 720
                        }
                    },

                    audio: false

                });


            // Connect camera to video

            cameraVideo.srcObject =
                cameraStream;


            cameraBox.style.display =
                "block";


            previewBox.style.display =
                "none";


            resultBox.style.display =
                "none";


            // Start video

            await cameraVideo.play();


            console.log(
                "Camera started successfully."
            );

        }

        catch (error) {

            console.error(
                "Camera Error:",
                error
            );


            showError(
                "Camera could not be opened. Please allow camera permission and try again."
            );

        }

    }


    // ==================================================
    // CAPTURE IMAGE
    // ==================================================

    captureButton.addEventListener(
        "click",
        captureImage
    );


    function captureImage() {

        hideError();


        if (!cameraStream) {

            showError(
                "Camera is not running."
            );

            return;
        }


        const width =
            cameraVideo.videoWidth;

        const height =
            cameraVideo.videoHeight;


        if (!width || !height) {

            showError(
                "Camera is not ready. Please wait a moment."
            );

            return;
        }


        // Create canvas

        const canvas =
            document.createElement("canvas");


        canvas.width =
            width;

        canvas.height =
            height;


        const context =
            canvas.getContext("2d");


        // Draw camera frame

        context.drawImage(
            cameraVideo,
            0,
            0,
            width,
            height
        );


        // Convert to JPEG

        canvas.toBlob(

            (blob) => {

                if (!blob) {

                    showError(
                        "Could not capture image."
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


                // Show captured image

                const imageURL =
                    URL.createObjectURL(
                        selectedImage
                    );


                previewImage.src =
                    imageURL;


                previewBox.style.display =
                    "block";


                cameraBox.style.display =
                    "none";


                resultBox.style.display =
                    "none";


                stopCamera();


                console.log(
                    "Camera image captured:",
                    selectedImage
                );

            },

            "image/jpeg",

            0.85

        );

    }


    // ==================================================
    // CLOSE CAMERA
    // ==================================================

    closeCameraButton.addEventListener(
        "click",
        () => {

            stopCamera();

            cameraBox.style.display =
                "none";

        }
    );


    // ==================================================
    // STOP CAMERA
    // ==================================================

    function stopCamera() {

        if (cameraStream) {

            cameraStream
                .getTracks()
                .forEach(
                    track => track.stop()
                );

            cameraStream =
                null;
        }


        cameraVideo.srcObject =
            null;

    }


    // ==================================================
    // UPLOAD BUTTON
    // ==================================================

    uploadButton.addEventListener(
        "click",
        () => {

            fileInput.click();

        }
    );


    // ==================================================
    // FILE SELECTED
    // ==================================================

    fileInput.addEventListener(
        "change",
        () => {

            hideError();


            const file =
                fileInput.files[0];


            if (!file) {

                return;
            }


            // Check image

            if (!file.type.startsWith("image/")) {

                showError(
                    "Please select an image file."
                );

                return;
            }


            // Save image

            selectedImage =
                file;


            // Show preview

            const imageURL =
                URL.createObjectURL(
                    file
                );


            previewImage.src =
                imageURL;


            previewBox.style.display =
                "block";


            cameraBox.style.display =
                "none";


            resultBox.style.display =
                "none";


            console.log(
                "Image selected:",
                file
            );

        }
    );


    // ==================================================
    // ANALYZE BUTTON
    // ==================================================

    analyzeButton.addEventListener(
        "click",
        analyzeProduct
    );


    // ==================================================
    // ANALYZE PRODUCT
    // ==================================================

    async function analyzeProduct() {

        hideError();


        if (!selectedImage) {

            showError(
                "Please capture or upload a product image first."
            );

            return;
        }


        loadingBox.style.display =
            "block";


        resultBox.style.display =
            "none";


        analyzeButton.disabled =
            true;


        try {

            console.log(
                "================================"
            );

            console.log(
                "Sending image to backend..."
            );


            // ==================================================
            // FORM DATA
            // ==================================================

            const formData =
                new FormData();


            formData.append(
                "productImage",
                selectedImage
            );


            // ==================================================
            // LOCAL NODE BACKEND
            // ==================================================

            const response =
                await fetch(
                    "http://localhost:3000/api/analyze",
                    {
                        method: "POST",
                        body: formData
                    }
                );


            console.log(
                "Backend HTTP status:",
                response.status
            );


            // ==================================================
            // READ RESPONSE
            // ==================================================

            const responseText =
                await response.text();


            console.log(
                "Backend response:",
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
                    "Backend returned an invalid response. HTTP " +
                    response.status
                );

            }


            // ==================================================
            // CHECK HTTP ERROR
            // ==================================================

            if (!response.ok) {

                throw new Error(
                    data.message ||
                    data.error ||
                    "Backend analysis failed."
                );

            }


            // ==================================================
            // CHECK SUCCESS
            // ==================================================

            if (!data.success) {

                throw new Error(
                    data.message ||
                    "Product analysis failed."
                );

            }


            console.log(
                "Product analysis completed!"
            );


            // ==================================================
            // DISPLAY RESULT
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
                error.message ||
                "Could not connect to backend."
            );

        }

        finally {

            loadingBox.style.display =
                "none";


            analyzeButton.disabled =
                false;

        }

    }


    // ==================================================
    // DISPLAY RESULT
    // ==================================================

    function displayResult(data) {

        resultBox.style.display =
            "block";


        // ==================================================
        // STATUS
        // ==================================================

        if (statusResult) {

            statusResult.innerHTML = `

                <strong>
                    ✅ Analysis Completed
                </strong>

                <br><br>

                ${escapeHTML(
                    data.message ||
                    "Product analyzed successfully."
                )}

            `;

        }


        // ==================================================
        // PRODUCT INFORMATION
        // ==================================================

        if (productInfo) {

            if (
                data.productInfo &&
                typeof data.productInfo === "object"
            ) {

                productInfo.innerHTML =
                    createObjectHTML(
                        data.productInfo
                    );

            }

            else {

                productInfo.innerHTML =
                    "<p>No product information returned.</p>";

            }

        }


        // ==================================================
        // COMPLIANCE
        // ==================================================

        if (complianceInfo) {

            if (
                data.compliance &&
                typeof data.compliance === "object"
            ) {

                complianceInfo.innerHTML =
                    createObjectHTML(
                        data.compliance
                    );

            }

            else {

                complianceInfo.innerHTML =
                    "<p>No compliance result returned.</p>";

            }

        }


        // ==================================================
        // OCR TEXT
        // ==================================================

        if (ocrText) {

            ocrText.textContent =
                data.text ||
                "No OCR text returned.";

        }


        // ==================================================
        // SCROLL TO RESULT
        // ==================================================

        resultBox.scrollIntoView({

            behavior: "smooth",

            block: "start"

        });

    }


    // ==================================================
    // CREATE OBJECT HTML
    // ==================================================

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


    // ==================================================
    // FORMAT KEY
    // ==================================================

    function formatKey(key) {

        return String(key)

            .replace(
                /([A-Z])/g,
                " $1"
            )

            .replace(
                /[_-]/g,
                " "
            )

            .replace(
                /^./,
                char =>
                    char.toUpperCase()
            );

    }


    // ==================================================
    // ESCAPE HTML
    // ==================================================

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


    // ==================================================
    // SHOW ERROR
    // ==================================================

    function showError(message) {

        if (!errorBox) {

            alert(message);

            return;
        }


        errorBox.textContent =
            "❌ " + message;


        errorBox.style.display =
            "block";


        if (resultBox) {

            resultBox.style.display =
                "none";

        }

    }


    // ==================================================
    // HIDE ERROR
    // ==================================================

    function hideError() {

        if (errorBox) {

            errorBox.style.display =
                "none";

        }

    }


    // ==================================================
    // PAGE EXIT
    // ==================================================

    window.addEventListener(
        "beforeunload",
        stopCamera
    );

});
