import express from "express"
import fs from "fs"
import path from "path"
import cors from "cors"
import open from "open"

const local = (filepath: string) => path.join(__dirname, filepath);

const app = express();
const port = 3001;

// Middleware to provide endpoints to serve public folder (app client)
app.use(express.static(local("public")))

app.use(cors())

let workingDirectory: string = ""

const isPhotoPath = (x: string) => x.endsWith(".jpeg") || x.endsWith(".jpg") || x.endsWith(".png")

app.post('/api/setWorkingDirectory', express.text({type: '*/*'}), (req, res) => {

    workingDirectory = req.body;

    // TODO Handle empty or non-existent folders
    if(!fs.existsSync(workingDirectory)){
        res.json([])
        return
    }
    let filesPaths = fs.readdirSync(workingDirectory)
    if(filesPaths.length === 0){
        res.json([])
        return
    }
    let files = filesPaths
        .filter(isPhotoPath)
        .sort((a,b) => {
            return a.length - b.length || a.localeCompare(b);
        })
    res.json(files)
})

app.get('/api/photo/:photoname', (req, res) => {
    let p = path.join(workingDirectory, req.params.photoname);
    res.sendFile(p)
})

app.post('/api/finish', express.json({type: '*/*'}), (req,res) => {
    let filesToSkip = req.body as string[]
    let skipFolderPath = path.join(workingDirectory, "skip");
    if(!fs.existsSync(skipFolderPath)) fs.mkdirSync(skipFolderPath)
    filesToSkip.forEach(x => {
        let source = path.join(workingDirectory, x)
        let destination = path.join(skipFolderPath, x)
        fs.renameSync(source, destination)
    });
    console.log(req.body)
    res.send(req.body)
})

app.get('/api/halt', (req, res) => {
    console.log("Halt!")
    res.sendStatus(200)
    process.exit(0);
})

app.get('*', (req, res) => {
    res.sendFile(local("/public/index.html"))
})

app.listen(port, () => {
    console.log(`Example app listening at http://localhost:${port}`);
})

open(`http://localhost:${port}`);

