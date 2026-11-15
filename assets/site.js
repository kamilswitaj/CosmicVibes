document.documentElement.classList.add("js");

for (const audio of document.querySelectorAll("audio")) {
  audio.addEventListener("play", () => {
    for (const other of document.querySelectorAll("audio")) {
      if (other !== audio) {
        other.pause();
      }
    }
  });
}
