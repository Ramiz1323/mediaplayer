console.log("Let's Write Js")


let currentSong = new Audio();
let songs;
let currentFolder;

function convertSecondsToMinutes(seconds) {
    if (isNaN(seconds) || seconds < 0) {
        return "00:00"
    }
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = Math.floor(seconds % 60);

    const formattedMinutes = String(minutes).padStart(2, '0');
    const formattedSeconds = String(remainingSeconds).padStart(2, '0');

    return `${formattedMinutes}:${formattedSeconds}`
}

async function getSongs(folder) {
    currentFolder = folder
    let a = await fetch(`/${folder}/`)
    let response = await a.text();
    let div = document.createElement("div")
    div.innerHTML = response;
    let as = div.getElementsByTagName("a")
    let songs = []
    for (let index = 0; index < as.length; index++) {
        const element = as[index];
        if (element.href.endsWith(".mp3")) {
            songs.push(element.href.split(`/${folder}/`)[1])
        }
    }

    //Show all The songs in the playlist 
    let songUL = document.querySelector(".songList").getElementsByTagName("ul")[0]
    songUL.innerHTML = ""
    for (const song of songs) {
        songUL.innerHTML = songUL.innerHTML + `<li>
            <img class="invert" src="./svgs/music.svg" alt="">
            <div class="info">
                <div>${song.replaceAll("%20", " ")}</div>
                <div>Artist</div>
            </div>
        </li>`;
    }

    //Attach a event listener to song
    Array.from(document.querySelector(".songList").getElementsByTagName("li")).forEach(e => {
        e.addEventListener("click", element => {
            console.log(e.querySelector(".info").firstElementChild.innerHTML)
            playMusic(e.querySelector(".info").firstElementChild.innerHTML.trim())
        })
    })
    return songs
}
const playMusic = (track, pause = false) => {
    // let audio = new Audio("/songs/" + track)
    currentSong.src = `/${currentFolder}/` + track
    if (!pause) {
        currentSong.play()
        play.src = "./svgs/pause.svg"
    }
    play.src = "./svgs/pause.svg"
    document.querySelector(".songinfo").innerHTML = decodeURI(track)
    document.querySelector(".songtime").innerHTML = "00:00 / 00:00"
}

async function displayAlbums() {
    let a = await fetch(`/songs/`)
    let response = await a.text();
    let div = document.createElement("div")
    div.innerHTML = response;
    let anchors = div.getElementsByTagName("a")
    let cardContainer = document.querySelector(".cardContainer")
    Array.from(anchors).forEach(async e => {
        if (e.href.includes("/songs/") && !e.href.includes(".htaccess")) {
            let folder = e.href.split("/").filter(Boolean).pop();
            //Get that Metadata of the Folder
            console.log(folder);

            try {
                let a = await fetch(`/songs/${folder}/info.json`);
                if (!a.ok) {
                    throw new Error(`JSON file not found: ${a.status}`);
                }
                let response = await a.json();
                console.log("Folder Metadata:", response);

                cardContainer.innerHTML += `
        <div data-folder="${folder}" class="card">
            <div class="play">
                <svg xmlns="http://www.w3.org/2000/svg" fill="#000000" height="45px" width="45px"
                    version="1.1" viewBox="0 0 210 210">
                    <circle cx="105" cy="105" r="100" fill="#5bb450" />
                    <path d="M150,105L70,150V60L150,105z" fill="black" />
                </svg>
            </div>
            <img src="/songs/${folder}/cover.jpeg" alt="">
            <h2 id="font-title">${response.title || "Unknown Album"}</h2>
            <p id="font-subtitle">${response.description || "No description available."}</p>
        </div>`;
            } catch (error) {
                console.error("Error fetching or parsing info.json:", error);

                // Fallback UI for missing metadata
                cardContainer.innerHTML += `
        <div data-folder="${folder}" class="card">
            <div class="play">
                <svg xmlns="http://www.w3.org/2000/svg" fill="#000000" height="45px" width="45px"
                    version="1.1" viewBox="0 0 210 210">
                    <circle cx="105" cy="105" r="100" fill="#5bb450" />
                    <path d="M150,105L70,150V60L150,105z" fill="black" />
                </svg>
            </div>
            <img src="/songs/${folder}/cover.jpeg" alt="">
            <h2 id="font-title">${folder}</h2>
            <p id="font-subtitle">Metadata not found.</p>
        </div>`;
            }

            //Load the playlist when was clicked
            Array.from(document.getElementsByClassName("card")).forEach(e => {
                // console.log(e)
                e.addEventListener("click", async item => {
                    console.log("Fetching Songs...")
                    songs = await getSongs(`songs/${item.currentTarget.dataset.folder}`)
                    playMusic(songs[0])
                })
            })
        }
    })
}
async function main() {
    //get the list of all songs
    songs = await getSongs("songs/Hindi")
    playMusic(songs[0], true)

    //Display all the albums on the page
    displayAlbums()


    //Attach an event listener to play, next and previous
    play.addEventListener("click", () => {
        if (currentSong.paused) {
            currentSong.play()
            play.src = "./svgs/pause.svg"
        }
        else {
            currentSong.pause()
            play.src = "./svgs/play.svg"
        }
    })

    //listen for timeupdate event
    currentSong.addEventListener("timeupdate", () => {
        document.querySelector(".songtime").innerHTML = `${convertSecondsToMinutes(currentSong.currentTime)} / ${convertSecondsToMinutes(currentSong.duration)}`
        document.querySelector(".circle").style.left = (currentSong.currentTime / currentSong.duration) * 100 + "%"
        // console.log(currentSong.currentTime)
    })

    //Event to automatically play the next song when the current one finishes
    currentSong.addEventListener("ended", () => {
        let index = songs.indexOf(currentSong.src.split("/").slice(-1)[0])
        if ((index + 1) < songs.length) {
            playMusic(songs[index + 1])
        }
        play.src = "./svgs/pause.svg"
    })

    //Add an event Listener to the seek bar
    document.querySelector(".seekbar").addEventListener("click", e => {
        let percent = (e.offsetX / e.target.getBoundingClientRect().width) * 100
        document.querySelector(".circle").style.left = percent + "%"
        currentSong.currentTime = (currentSong.duration * percent) / 100
    })

    //Add an event listener for hamburger
    document.querySelector(".hamburger").addEventListener("click", () => {
        document.querySelector(".left").style.left = "0"
    })

    //Add an event listener for close button
    document.querySelector(".close").addEventListener("click", () => {
        document.querySelector(".left").style.left = "-110%"
    })

    //Add an event listener Previous and Next
    previous.addEventListener("click", () => {
        console.log("Previous Clicked")
        let index = songs.indexOf(currentSong.src.split("/").slice(-1)[0])
        if ((index - 1) >= 0) {
            playMusic(songs[index - 1])
        }
    })
    next.addEventListener("click", () => {
        console.log("Next Clicked")
        let index = songs.indexOf(currentSong.src.split("/").slice(-1)[0])
        if ((index + 1) < songs.length) {
            playMusic(songs[index + 1])
        }
    })
    //Add an event listener to volume
    document.querySelector(".range").getElementsByTagName("input")[0].addEventListener("change", (e) => {
        console.log("Setting Volume to", e.target.value, "/ 100")
        currentSong.volume = parseInt(e.target.value) / 100
    })
    document.querySelector(".range").getElementsByTagName("input")[0].value = 100
    //Add event listener to mute the track
    document.querySelector(".volume>img").addEventListener("click", e => {
        if (e.target.src.includes("/svgs/volume.svg")) {
            e.target.src = e.target.src.replace("/svgs/volume.svg", "/svgs/mute.svg")
            currentSong.volume = 0;
            document.querySelector(".range").getElementsByTagName("input")[0].value = 0
        }
        else {
            e.target.src = e.target.src.replace("/svgs/mute.svg", "/svgs/volume.svg")
            currentSong.volume = .1;
            document.querySelector(".range").getElementsByTagName("input")[0].value = 10
        }
    })

}

main()