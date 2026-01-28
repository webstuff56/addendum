 function openModal() {
        document.getElementById("gameModal").style.display = "block";
    }
    function closeModal() {
        document.getElementById("gameModal").style.display = "none";
    }
    window.onclick = function(event) {
        if (event.target == document.getElementById("gameModal")) {
            closeModal();
        }
    }