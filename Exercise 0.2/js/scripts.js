// Wait for the HTML document to finish loading before running the script
document.addEventListener('DOMContentLoaded', () => {
    const loadDataBtn = document.getElementById('load-data-btn');
    const dataOutput = document.getElementById('data-output');

    // Add a click event to the button
    loadDataBtn.addEventListener('click', () => {
        // Show a message to simulate an interaction
        dataOutput.style.display = 'block';
        dataOutput.innerHTML = `
            <strong>Success!</strong> The JavaScript interaction is working. 
            <br>
            <em>Note: In upcoming exercises, you will write code here to load the TV energy consumption data from 'data/data.csv' using D3.js.</em>
        `;
        loadDataBtn.textContent = 'Interaction Verified';
        loadDataBtn.disabled = true;
        loadDataBtn.style.backgroundColor = '#95a5a6';
        loadDataBtn.style.cursor = 'not-allowed';
    });
});