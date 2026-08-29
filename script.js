```javascript
// ======================================================
// LABELGUARD AI - FRONTEND SCRIPT
// ======================================================

let cameraStream = null;

// Backend URL
const BACKEND_URL = "http://localhost:3000";


// ======================================================
// START CAMERA
// ======================================================

async function startCamera() {
    try {
        const video = document.getElementById("camera");

        if (!video) {
            alert("Camera element not found.");
            return;
        }

        // Stop previous camera
        stopCamera();

        if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
            alert("Camera is not supported by this browser.");
            return;
        }

        cameraStream = await navigator.mediaDevices.getUserMedia({
            video: {
                facingMode: {
                    ideal: "environment"
                }
            },
            audio: false
        });

        video.srcObject = cameraStream;

        await video.play();

        console.log("Camera started successfully.");

    } catch (error) {
        console.error("Camera Error:", error);

        alert(
            "Cannot access camera.\n\n" +
            "Please allow camera permission and try again."
        );
    }
}


// ======================================================
// TAKE PHOTO
// ======================================================

function takePhoto() {
    const video = document.getElementById("camera");
    const canvas = document.getElementById("canvas");
    const preview = document.getElementById("preview");
    const container = document.getElementById("preview-container");

    if (!video || !canvas || !preview || !container) {
        alert("Camera elements are missing.");
        console.error("Camera elements not found.");
        return;
    }

    if (!cameraStream) {
        alert("Please click Start Camera first.");
        return;
    }

    if (video.videoWidth === 0 || video.videoHeight === 0) {
        alert("Camera is not ready. Please wait a moment and try again.");
        return;
    }

    // Set canvas size
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;

    const context = canvas.getContext("2d");

    if (!context) {
        alert("Could not create image.");
        return;
    }

    // Capture image
    context.drawImage(
        video,
        0,
        0,
        canvas.width,
        canvas.height
    );

    // Convert image to PNG
    const imageData = canvas.toDataURL("image/png");

    preview.src = imageData;

    // Clear old uploaded file reference
    delete preview.dataset.objectUrl;

    // Show preview
    container.style.display = "block";

    console.log(
        "Photo captured:",
        canvas.width,
        "x",
        canvas.height
    );
}


// ======================================================
// STOP CAMERA
// ======================================================

function stopCamera() {
    if (cameraStream) {
        cameraStream.getTracks().forEach(function(track) {
            track.stop();
        });

        cameraStream = null;
    }

    const video = document.getElementById("camera");

    if (video) {
        video.srcObject = null;
    }

    console.log("Camera stopped.");
}


// ======================================================
// PREVIEW UPLOADED IMAGE
// ======================================================

function previewImage(event) {
    const input = event.target;
    const file = input.files && input.files[0];

    if (!file) {
        console.log("No file selected.");
        return;
    }

    console.log("Selected file:", file.name);
    console.log("File type:", file.type);
    console.log("File size:", file.size);

    // Check image
    if (!file.type.startsWith("image/")) {
        alert("Please select a valid image file.");
        input.value = "";
        return;
    }

    const preview = document.getElementById("preview");
    const container = document.getElementById("preview-container");

    if (!preview || !container) {
        alert("Preview elements not found.");
        return;
    }

    // Stop camera
    stopCamera();

    // Remove previous object URL
    if (preview.dataset.objectUrl) {
        URL.revokeObjectURL(preview.dataset.objectUrl);
    }

    // Create new object URL
    const imageURL = URL.createObjectURL(file);

    preview.dataset.objectUrl = imageURL;

    // Display image
    preview.src = imageURL;

    // Show preview
    container.style.display = "block";

    console.log("Image preview displayed.");

    // Scroll to preview
    setTimeout(function() {
        container.scrollIntoView({
            behavior: "smooth",
            block: "center"
        });
    }, 100);
}


// ======================================================
// ADD PRODUCT FIELD
// ======================================================

function addProductField(container, label, value) {
    if (
        value === undefined ||
        value === null ||
        value === "" ||
        String(value).toLowerCase() === "not detected"
    ) {
        return;
    }

    const p = document.createElement("p");

    const strong = document.createElement("strong");
    strong.textContent = label + ":";

    const span = document.createElement("span");
    span.textContent = " " + value;

    p.appendChild(strong);
    p.appendChild(span);

    container.appendChild(p);
}


// ======================================================
// DISPLAY PRODUCT INFORMATION
// ======================================================

function displayProductInfo(info, category) {
    const productInfo = document.getElementById("productInfo");

    if (!productInfo) {
        console.error("productInfo element not found.");
        return;
    }

    productInfo.innerHTML = "";

    addProductField(
        productInfo,
        "Category",
        category || info.category || "Unknown"
    );

    addProductField(
        productInfo,
        "Product Name",
        info.productName
    );

    addProductField(
        productInfo,
        "MRP",
        info.mrp
    );

    addProductField(
        productInfo,
        "Net Quantity",
        info.netQuantity
    );

    // Stationery fields
    if (
        category &&
        category.toLowerCase() === "stationery"
    ) {
        addProductField(
            productInfo,
            "Pages",
            info.pages
        );

        addProductField(
            productInfo,
            "Size",
            info.size
        );
    }

    addProductField(
        productInfo,
        "Best Before / Expiry",
        info.bestBefore
    );

    addProductField(
        productInfo,
        "Batch Number",
        info.batchNumber
    );

    addProductField(
        productInfo,
        "FSSAI",
        info.fssai
    );

    addProductField(
        productInfo,
        "Manufacturer",
        info.manufacturer
    );
}


// ======================================================
// DISPLAY COMPLIANCE
// ======================================================

function displayCompliance(compliance) {
    const complianceBox =
        document.getElementById("complianceResult");

    if (!complianceBox) {
        console.error("complianceResult element not found.");
        return;
    }

    if (!compliance || !compliance.checks) {
        complianceBox.innerHTML = "";
        return;
    }

    const summary = compliance.summary || {};

    const total = Number(summary.total || 0);
    const found = Number(summary.found || 0);
    const needsReview = Number(summary.needsReview || 0);

    const percentage =
        summary.percentage !== undefined
            ? summary.percentage
            : (compliance.score || 0);

    const status =
        compliance.status ||
        (needsReview === 0 ? "COMPLIANT" : "NEEDS REVIEW");

    const isCompliant = status === "COMPLIANT";

    let html = "";

    // Header
    html += `
        <h3>🛡️ Compliance Check</h3>

        <div class="overall-status ${
            isCompliant
                ? "overall-compliant"
                : "overall-review"
        }">
            ${
                isCompliant
                    ? "✅ COMPLIANT"
                    : "⚠️ NEEDS REVIEW"
            }
        </div>

        <p class="compliance-category">
            <strong>Category:</strong>
            ${escapeHTML(compliance.category || "Unknown")}
        </p>

        <div class="compliance-score">
            <strong>Compliance Score</strong>
            <span>${percentage}%</span>
        </div>

        <div class="compliance-summary">

            <p>
                <strong>Total</strong><br>
                ${total}
            </p>

            <p>
                <strong>Found</strong><br>
                ${found}
            </p>

            <p>
                <strong>Needs Review</strong><br>
                ${needsReview}
            </p>

        </div>
    `;

    // Missing fields
    const missingFields = compliance.missingFields || [];

    if (missingFields.length > 0) {
        html += `
            <div class="missing-fields">

                <strong>
                    ⚠️ Missing / Needs Review
                </strong>

                <ul>
        `;

        missingFields.forEach(function(field) {
            html += `
                <li>${escapeHTML(String(field))}</li>
            `;
        });

        html += `
                </ul>

            </div>
        `;
    }

    // Individual checks
    compliance.checks.forEach(function(check) {
        const isFound = check.status === "FOUND";

        html += `
            <div class="compliance-item">

                <strong>
                    ${escapeHTML(String(check.field || ""))}
                </strong>

                <span>
                    ${escapeHTML(String(check.value || ""))}
                </span>

                <b class="${
                    isFound
                        ? "status-found"
                        : "status-review"
                }">

                    ${
                        isFound
                            ? "✓ FOUND"
                            : "⚠ REVIEW"
                    }

                </b>

            </div>
        `;
    });

    complianceBox.innerHTML = html;
}


// ======================================================
// ESCAPE HTML
// ======================================================

function escapeHTML(value) {
    return value
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#039;");
}


// ======================================================
// ANALYZE PRODUCT
// ======================================================

async function analyzeProduct() {
    const preview = document.getElementById("preview");
    const container = document.getElementById("preview-container");

    // Find analyze button safely
    let analyzeButton = null;

    if (container) {
        analyzeButton =
            container.querySelector(".primary-btn");
    }

    if (!preview) {
        alert("Preview image not found.");
        return;
    }

    // Check image
    if (
        !preview.src ||
        preview.src === window.location.href
    ) {
        alert(
            "Please capture or upload a product image first."
        );
        return;
    }

    try {
        console.log("=================================");
        console.log("Starting Product Analysis");
        console.log("=================================");

        // Disable button
        if (analyzeButton) {
            analyzeButton.disabled = true;
            analyzeButton.textContent = "⏳ Analyzing...";
        }

        // Prepare image
        console.log("Preparing image...");

        const response = await fetch(preview.src);

        if (!response.ok) {
            throw new Error(
                "Could not read the selected image."
            );
        }

        const blob = await response.blob();

        console.log(
            "Image prepared:",
            blob.size,
            "bytes"
        );

        // Create FormData
        const formData = new FormData();

        formData.append(
            "productImage",
            blob,
            "product.png"
        );

        console.log("Sending image to backend...");

        // Send to backend
        const result = await fetch(
            BACKEND_URL + "/analyze",
            {
                method: "POST",
                body: formData
            }
        );

        console.log(
            "Backend HTTP status:",
            result.status
        );

        if (!result.ok) {
            let errorMessage =
                "Backend returned HTTP " +
                result.status;

            try {
                const errorData =
                    await result.json();

                if (errorData.message) {
                    errorMessage =
                        errorData.message;
                }
            } catch (error) {
                console.log(
                    "Could not read backend error."
                );
            }

            throw new Error(errorMessage);
        }

        // Read JSON
        const data = await result.json();

        console.log(
            "Backend response:",
            data
        );

        // Success check
        if (!data.success) {
            throw new Error(
                data.message ||
                "Product analysis failed."
            );
        }

        // Product information
        const info =
            data.productInfo || {};

        // Category
        const category =
            data.compliance?.category ||
            info.category ||
            data.category ||
            "Unknown";

        console.log(
            "Detected Category:",
            category
        );

        // Display product information
        displayProductInfo(
            info,
            category
        );

        // Display OCR text
        const ocrText =
            document.getElementById("ocrText");

        if (ocrText) {
            ocrText.textContent =
                data.text ||
                "No text extracted.";
        }

        // Display compliance
        displayCompliance(
            data.compliance
        );

        // Make result visible
        const ocrResult =
            document.getElementById("ocrResult");

        if (ocrResult) {
            ocrResult.style.display = "block";
        }

        console.log("=================================");
        console.log("Product Analysis Completed");
        console.log("=================================");

        // Scroll to result
        if (ocrResult) {
            setTimeout(function() {
                ocrResult.scrollIntoView({
                    behavior: "smooth",
                    block: "start"
                });
            }, 200);
        }

    } catch (error) {
        console.error("=================================");
        console.error("Analysis Error:", error);
        console.error("=================================");

        alert(
            "❌ Product analysis failed.\n\n" +
            error.message +
            "\n\n" +
            "Make sure the backend is running on:\n" +
            "http://localhost:3000"
        );

    } finally {
        // Enable button
        if (analyzeButton) {
            analyzeButton.disabled = false;
            analyzeButton.textContent =
                "🔍 Analyze Product";
        }
    }
}


// ======================================================
// START SCAN
// ======================================================

function startScan() {
    window.location.href = "pages/scan.html";
}


// ======================================================
// UPLOAD PRODUCT
// ======================================================

function uploadProduct() {
    window.location.href = "pages/scan.html";
}


// ======================================================
// CLEANUP
// ======================================================

window.addEventListener(
    "beforeunload",
    function() {
        stopCamera();
    }
);


// ======================================================
// PAGE LOAD
// ======================================================

document.addEventListener(
    "DOMContentLoaded",
    function() {

        console.log(
            "LabelGuard AI frontend loaded."
        );

        // Make sure preview is hidden initially
        const container =
            document.getElementById(
                "preview-container"
            );

        if (container) {
            container.style.display = "none";
        }
    }
);
```
