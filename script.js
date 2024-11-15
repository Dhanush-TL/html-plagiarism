document.getElementById("fileUpload").addEventListener("change", function (event) {
    readFileContent(event, "sampleText");
});

document.getElementById("compareFileUpload").addEventListener("change", function (event) {
    readFileContent(event, "userText");
});

function readFileContent(event, textAreaId) {
    const file = event.target.files[0];
    if (!file) {
        alert("No file selected.");
        return;
    }

    const reader = new FileReader();

    reader.onload = function (e) {
        const content = e.target.result.trim(); // Remove any extra spaces
        if (content) {
            document.getElementById(textAreaId).value = content;
            updateCharacterCount();
            checkPlagiarism(); // Trigger plagiarism check if both areas are filled
        } else {
            alert("The file is empty or cannot be read.");
        }
    };

    reader.onerror = function () {
        alert("Error reading the file. Please try again.");
    };

    reader.readAsText(file);
}

function checkPlagiarism() {
    const sampleText = document.getElementById("sampleText").value.trim();
    const userText = document.getElementById("userText").value.trim();

    if (!sampleText || !userText) {
        alert("Please fill in both text areas or upload files for comparison.");
        return;
    }

    const commonWords = findCommonWords(sampleText, userText);
    const similarity = calculateSimilarity(sampleText, userText, commonWords);

    updateProgressRing(similarity);
    updateSummaryBox(similarity);
    displayDetailedReport(similarity, commonWords, sampleText, userText);
}

function findCommonWords(sampleText, userText) {
    const sampleWords = sampleText.split(/\s+/).map(word => word.toLowerCase());
    const userWords = userText.split(/\s+/).map(word => word.toLowerCase());
    return [...new Set(sampleWords.filter(word => userWords.includes(word)))];
}

function calculateSimilarity(sampleText, userText, commonWords) {
    const totalWords = new Set([...sampleText.split(/\s+/), ...userText.split(/\s+/)]).size;
    return Math.round((commonWords.length / totalWords) * 100);
}

function updateProgressRing(similarity) {
    const circle = document.getElementById("circle");
    circle.style.strokeDasharray = `${similarity}, 100`;

    const color = similarity < 30 ? "#28a745" : similarity < 60 ? "#FFA500" : "#dc3545";
    circle.style.stroke = color;
    document.getElementById("similarityPercentage").innerText = `${similarity}%`;
}

function updateSummaryBox(similarity) {
    const summaryBox = document.getElementById("summaryBox");
    summaryBox.style.backgroundColor = similarity < 30 ? "#d4edda" : similarity < 60 ? "#FFF3CD" : "#F8D7DA";
    summaryBox.innerText = similarity < 30 ? "Similarity Level: Unique Content" : similarity < 60 ? "Similarity Level: Moderate" : "Similarity Level: High";
}

function displayDetailedReport(similarity, commonWords, sampleText, userText) {
    document.getElementById("similarityResult").innerText = `Similarity: ${similarity}%`;
    document.getElementById("commonWords").innerText = `Common Words: ${commonWords.join(", ")}`;

    const highlightedText = highlightCommonWords(sampleText, userText, commonWords);
    document.getElementById("highlightedText").innerHTML = `<strong>Highlighted User Text:</strong><br>${highlightedText}`;
    document.getElementById("detailedReport").style.display = "block";
}

function highlightCommonWords(sampleText, userText, commonWords) {
    let highlightedText = userText;
    commonWords.forEach(word => {
        const regex = new RegExp(`\\b(${word})\\b`, "gi");
        highlightedText = highlightedText.replace(regex, `<span class="highlight">$1</span>`);
    });
    return highlightedText;
}

function updateCharacterCount() {
    const sampleTextCount = document.getElementById("sampleText").value.length;
    const userTextCount = document.getElementById("userText").value.length;

    document.getElementById("sampleTextCount").innerText = `Sample Text Characters: ${sampleTextCount}, Words: ${document.getElementById("sampleText").value.split(/\s+/).length}`;
    document.getElementById("userTextCount").innerText = `User Text Characters: ${userTextCount}, Words: ${document.getElementById("userText").value.split(/\s+/).length}`;
}

function resetFields() {
    document.getElementById("sampleText").value = "";
    document.getElementById("userText").value = "";
    document.getElementById("similarityPercentage").innerText = "0%";
    document.getElementById("circle").style.strokeDasharray = `0, 100`;
    document.getElementById("summaryBox").style.backgroundColor = "";
    document.getElementById("detailedReport").style.display = "none";
    updateCharacterCount();
}

function downloadReport() {
    const similarity = document.getElementById("similarityPercentage").innerText.replace('%', '');
    const similarityText = `Similarity: ${similarity}%`;
    const commonWordsText = document.getElementById("commonWords").innerText;
    const highlightedText = document.getElementById("highlightedText").innerText;
    
    let reportContent = `Plagiarism Report\n\n${similarityText}\n\n${commonWordsText}\n\nHighlighted Text:\n${highlightedText}`;
    
    const blob = new Blob([reportContent], { type: 'text/plain' });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = "Plagiarism_Report.txt";
    
    // Trigger the download
    link.click();
}
