let input = document.getElementById("workingFolderInput") as HTMLInputElement
let screen1 = document.getElementById("screen-1") as HTMLDivElement
let screen2 = document.getElementById("screen-2") as HTMLDivElement
let screen3 = document.getElementById("screen-3") as HTMLDivElement
let img = document.getElementById("img") as HTMLImageElement

let screenTwoTitle = document.getElementById("screen-2-title") as HTMLElement

let button = document.getElementById("button-reset") as HTMLButtonElement
type State = "initial" | "photo" | "fin"

let fileNames: string[] = []
let index = 0
let skipIndicesSet: number[] = []
let state: State = "initial"
const setState = (s: State) => {
    state = s
    render()
}

const isFin = () => state === "fin"

const render = () => {
    screen1.style.display = state === "initial" ? "flex" : "none"
    screen2.style.display = state === "photo" ? "flex" : "none"
    screen3.style.display = state === "fin" ? "flex" : "none"
    if (state === "fin") {
        renderFin()
    }
    if (state === "photo") img.src = `./api/photo/${fileNames[index]}`
}

const renderFin = () => {
    let skipText = document.getElementById("skip-text") as HTMLSpanElement
    skipText.textContent = skipIndicesSet.length.toString()
    let totalText = document.getElementById("total-text") as HTMLSpanElement
    totalText.textContent = fileNames.length.toString()
}

const reset = () => {
    index = 0
    skipIndicesSet = []
    setState("initial")
    img.src = ''
}

const next = () => {
    if (isFin()) return
    index++
    if (index >= fileNames.length) {
        finish()
        return;
    }
    render()
}

const finish = async () => {
    let listToSkip = skipIndicesSet.map(x => fileNames[x]);

    await fetch('/api/finish', {
        method: "POST",
        body: JSON.stringify(listToSkip)
    })

    setState("fin")
}

const skip = () => {
    if (isFin()) return
    skipIndicesSet.push(index)
    next()
}

const back = () => {
    if (index === 0) return
    index--;

    let i = skipIndicesSet.indexOf(index)

    if (i !== -1) {
        skipIndicesSet.splice(i, 1);
    }
    render()
}

const fetchFiles = async (dir: string): Promise<string[]> => {
    //TODO Handle exceptions or errors
    const x = await fetch("./api/setWorkingDirectory", {
        method: "POST",
        body: dir
    })
    return await x.json()
}

input.addEventListener("keyup", async e => {
    if (e.key !== 'Enter') return

    fileNames = await fetchFiles(input.value)
    if (fileNames.length === 0) {
        setState("fin")
    } else {
        setState("photo")
    }
});

document.addEventListener("keydown", e => {
    if (e.key === "ArrowRight") {
        next()
    }
    if (e.key === "ArrowLeft") {
        skip()
    }
    if (e.key === "ArrowUp") {
        back()
    }
})

button.addEventListener("click", e => {
    reset();
})

window.addEventListener("beforeunload", e => {
    fetch("./api/halt")
})