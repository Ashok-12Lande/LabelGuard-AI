// ======================================================
// LABELGUARD AI
// CAMERA + FOLDER + IMAGE PREVIEW + API ANALYSIS
// ======================================================


// ======================================================
// ELEMENTS
// ======================================================

const cameraInput = document.getElementById("cameraInput");
const fileInput = document.getElementById("fileInput");

const cameraBtn = document.getElementById("cameraBtn");
const fileBtn = document.getElementById("fileBtn");

const previewContainer =
    document.getElementById("previewContainer");

const imagePreview =
    document.getElementById("imagePreview");

const imageName =
    document.getElementById("imageName");

const analyzeBtn =
    document.getElementById("analyzeBtn");

const resultBox =
    document.getElementById("result");


// ======================================================
// SELECTED IMAGE
// ======================================================

let selectedImage = null;


// ======================================================
// CAMERA BUTTON
// ======================================================

if (cameraBtn && cameraInput) {

    cameraBtn.addEventListener("click", function () {

        cameraInput.click();

    });

}


// ======================================================
// FOLDER BUTTON
// ======================================================

if (fileBtn && fileInput) {

    fileBtn.addEventListener("click", function () {

        fileInput.click();

    });

}


// ======================================================
// CAMERA IMAGE
// ======================================================

if (cameraInput) {

    cameraInput.addEventListener("change", function (event) {

        const file = event.target.files[0];

        if (!file) {
            return;
        }

        selectImage(file);

    });

}


// ======================================================
// FOLDER IMAGE
// ======================================================

if (fileInput) {

    fileInput.addEventListener("change", function (event) {

        const file = event.target.files[0];

        if (!file) {
            return;
        }

        selectImage(file);

    });

}


// ======================================================
// SELECT IMAGE
// ======================================================

function selectImage(file) {

    // Check image

    if (!file.type.startsWith("image/")) {

        alert("Please select an image file.");

        return;

    }


    // Save image

    selectedImage = file;


    // Create preview URL

    const imageURL =
        URL.createObjectURL(file);


    // Show preview

    if (imagePreview) {

        imagePreview.src = imageURL;

    }


    // Show filename

    if (imageName) {

        imageName.textContent =
            "Selected: " + file.name;

    }


    // Show preview container

    if (previewContainer) {

        previewContainer.style.display =
            "block";

    }


    console.log(
        "Image selected:",
        file.name
    );

    console.log(
        "Image size:",
        file.size,
        "bytes"
    );

    console.log(
        "Image type:",
        file.type
    );

}


// ======================================================
// ANALYZE BUTTON
// ======================================================

if (analyzeBtn) {

    analyzeBtn.addEventListener(
        "click",
        analyzeProduct
    );

}


// ======================================================
// ANALYZE PRODUCT
// ======================================================

async function analyzeProduct() {

    // Check image

    if (!selectedImage) {

        alert(
            "Please take a photo or select an image first."
        );

        return;

    }


    // Show loading

    if (resultBox) {

        resultBox.style.display =
            "block";

        resultBox.innerHTML = `
            <div>
                <h2>⏳ Analyzing Product...</h2>
                <p>
                    Please wait while LabelGuard AI
                    reads the product label.
                </p>
            </div>
        `;

    }


    // Disable button

    if (analyzeBtn) {

        analyzeBtn.disabled = true;

        analyzeBtn.textContent =
            "⏳ Analyzing...";

    }


    try {

        // Create form data

        const formData =
            new FormData();


        // IMPORTANT
        // Backend expects productImage

        formData.append(
            "productImage",
            selectedImage
        );


        console.log(
            "Sending image to /api/analyze..."
        );


        // Send image to Vercel

        const response =
            await fetch(
                "/api/analyze",
                {
                    method: "POST",
                    body: formData
                }
            );


        console.log(
            "Response status:",
            response.status
        );


        // Try to read JSON

        const data =
            await response.json();


        console.log(
            "API response:",
            data
        );


        // API error

        if (!response.ok) {

            throw new Error(
                data.message ||
                "Server returned an error."
            );

        }


        // Display result

        showResult(data);


    }
    catch (error) {

        console.error(
            "Analysis error:",
            error
        );


        if (resultBox) {

            resultBox.style.display =
                "block";

            resultBox.innerHTML = `

                <div>

                    <h2>❌ Analysis Failed</h2>

                    <p>
                        ${escapeHTML(
                            error.message
                        )}
                    </p>

                    <p>
                        Please try another image.
                    </p>

                </div>

            `;

        }

    }
    finally {

        // Enable button

        if (analyzeBtn) {

            analyzeBtn.disabled =
                false;

            analyzeBtn.textContent =
                "🔍 Analyze Product";

        }

    }

}


// ======================================================
// SHOW RESULT
// ======================================================

function showResult(data) {

    if (!resultBox) {
        return;
    }


    resultBox.style.display =
        "block";


    const product =
        data.productInfo || {};

    const compliance =
        data.compliance || {};


    resultBox.innerHTML = `

        <div>

            <h2>
                📊 Product Analysis Result
            </h2>


            <p>
                <strong>Product Name:</strong>
                ${safeValue(product.productName)}
            </p>


            <p>
                <strong>Category:</strong>
                ${safeValue(product.category)}
            </p>


            <p>
                <strong>MRP:</strong>
                ${safeValue(product.mrp)}
            </p>


            <p>
                <strong>Net Quantity:</strong>
                ${safeValue(product.netQuantity)}
            </p>


            <p>
                <strong>Pages:</strong>
                ${safeValue(product.pages)}
            </p>


            <p>
                <strong>Size:</strong>
                ${safeValue(product.size)}
            </p>


            <p>
                <strong>Manufacturer:</strong>
                ${safeValue(product.manufacturer)}
            </p>


            <p>
                <strong>Batch Number:</strong>
                ${safeValue(product.batchNumber)}
            </p>


            <p>
                <strong>Best Before:</strong>
                ${safeValue(product.bestBefore)}
            </p>


            <p>
                <strong>FSSAI:</strong>
                ${safeValue(product.fssai)}
            </p>


            <hr>


            <h3>
                ⚖️ Compliance Result
            </h3>


            <p>
                <strong>Status:</strong>
                ${safeValue(compliance.status)}
            </p>


            <p>
                <strong>Score:</strong>
                ${safeValue(compliance.score)}
            </p>


            <hr>


            <h3>
                📝 OCR Text
            </h3>


            <pre
                style="
                    white-space:pre-wrap;
                    overflow-wrap:break-word;
                "
            >${safeValue(data.text)}</pre>


        </div>

    `;

}


// ======================================================
// SAFE VALUE
// ======================================================

function safeValue(value) {

    if (
        value === null ||
        value === undefined ||
        value === ""
    ) {

        return "Not detected";

    }


    return escapeHTML(value);

}


// ======================================================
// ESCAPE HTML
// ======================================================

function escapeHTML(value) {

    return String(value)
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#039;");

}