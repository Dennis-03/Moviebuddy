$(document).ready(function () {
  $("#carousel").find(".carousel-item").first().addClass("active");
});

// counter
$(".count").each(function () {
  $(this)
    .prop("Counter", 0)
    .animate(
      {
        Counter: $(this).text(),
      },
      {
        duration: 2000,
        easing: "swing",
        step: function (now) {
          $(this).text(Math.ceil(now));
        },
      }
    );
});

window.onclick = function (event) {
  if (event.target == modal) {
    modal.style.display = "none";
  }
};
