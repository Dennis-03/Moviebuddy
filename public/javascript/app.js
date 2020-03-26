const btn = document.getElementById("run");
btn.onclick = async function main() {
  const search = document.getElementById("search").value;
  console.log(search);
  const view = document.getElementById("view");
  console.log(view);
  let request = new XMLHttpRequest();
  request.open(
    "GET",
    "http://www.omdbapi.com/?apikey=6df39d0d&s=" + search,
    true
  );
  // view.innerHTML(`<div>`);
  request.onload = function() {
    let data = JSON.parse(request.response).Search;
    console.log(data);
    data.forEach(movie => {
      view.innerHTML +=
        '    <form action="/search" method="POST"> <input type="text" name=search value="' +
        movie.Title +
        '"/><img src="' +
        movie.Poster +
        '"><button type=submit>Watchlist</button></form>';
    });
  };
  request.send();

  // await fetch("/search", {
  //   method: "POST",
  //   body: {
  //     title: "dennis"
  //   }
  // })
  //   .then(res => res.json())
  //   .then(data => {
  //     console.log(data);
  //     // const datas = data;
  //   });
  // console.log(datas);
};

// const btn = document.getElementById("run");
// btn.onclick = function main() {
//   const search = document.getElementById("search").value;
//   alert(search);
// };
// const render = document.getElementById("render");
// console.log(render);
// function search(movie) {
//   console.log(movie);
// }
