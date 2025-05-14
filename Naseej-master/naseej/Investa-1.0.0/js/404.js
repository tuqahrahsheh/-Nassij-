const steps = document.querySelectorAll(".form-step");
const nextBtns = document.querySelectorAll(".next-step");
const prevBtns = document.querySelectorAll(".prev-step");

let currentStep = 0;

nextBtns.forEach(button => {
    button.addEventListener("click", () => {
        steps[currentStep].style.display = "none";
        currentStep++;
        steps[currentStep].style.display = "block";
    });
});

prevBtns.forEach(button => {
    button.addEventListener("click", () => {
        steps[currentStep].style.display = "none";
        currentStep--;
        steps[currentStep].style.display = "block";
    });
});







