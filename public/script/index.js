// Authentication modal functionality
const authBtn = document.getElementById("auth-btn");
const authModal = document.getElementById("auth-modal");
const signupModal = document.getElementById("signup-modal");
const closeAuthModal = document.getElementById("close-auth-modal");
const closeSignupModal = document.getElementById("close-signup-modal");
const showSignup = document.getElementById("show-signup");
const showLogin = document.getElementById("show-login");

authBtn.addEventListener("click", () => {
  authModal.classList.remove("hidden");
});

closeAuthModal.addEventListener("click", () => {
  authModal.classList.add("hidden");
});

closeSignupModal.addEventListener("click", () => {
  signupModal.classList.add("hidden");
});

showSignup.addEventListener("click", (e) => {
  authModal.classList.add("hidden");
  signupModal.classList.remove("hidden");
});

showLogin.addEventListener("click", (e) => {
  signupModal.classList.add("hidden");
  authModal.classList.remove("hidden");
});

// Course enrollment (demo functionality)
document.querySelectorAll(".course-card button").forEach((button) => {
  button.addEventListener("click", function () {
    const courseTitle =
      this.closest(".course-card").querySelector("h3").textContent;
    const cartCount = document.querySelector("#cart-btn span");

    // Increment cart count
    let count = parseInt(cartCount.textContent);
    cartCount.textContent = count + 1;

    // Show alert (in real app this would redirect to cart)
    alert(`Added "${courseTitle}" to your cart`);
  });
});
