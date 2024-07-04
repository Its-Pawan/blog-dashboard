import { MongoClient, ObjectId } from 'mongodb'
import express from 'express'
import bodyParser from 'body-parser'
import multer from 'multer';
import cors from 'cors';


// Set up multer for file uploads
const storage = multer.memoryStorage();
const upload = multer({ storage: storage });


// Get current date in UTC
const currentDate = new Date();
const day = currentDate.getDate();
const month = currentDate.getMonth() + 1;
const year = currentDate.getFullYear();
const today = `${day}-${month}-${year}`

const app = express()
app.use(bodyParser.urlencoded({ extended: true }))
app.set('view engine', 'ejs')
app.use(cors());
app.use(express.static("public"))


// Connection URL
const url = 'mongodb+srv://businesspawanjoshi:pawan9494joshi9494@portfolio.sojrade.mongodb.net/';
const client = new MongoClient(url);

const dbName = 'pawan';

async function connectDb() {
    try {
        await client.connect();
        console.log('Connected successfully to server ');

    } catch (error) {
        console.log("Failed to connect: ", error);
    }
}
connectDb()


async function getData() {
    try {
        const db = client.db(dbName);
        const collection = db.collection('blogs');
        const findResult = await collection.find({}).toArray();
        // console.log(findResult);
        return findResult;
    } catch (error) {
        console.log(error);
    }
}

async function postData(title, content, desc, img) {
    try {
        const db = client.db(dbName);
        const collection = db.collection('blogs');
        const insertResult = await collection.insertOne(
            { title: title, content: content, description: desc, image: img, publishDate: today },
        )
        // console.log('Inserted documents =>', insertResult);
        return insertResult;
    } catch (error) {
        console.log(error);
    }
}


async function deleteData(id) {
    try {
        const db = client.db(dbName);
        const collection = db.collection('blogs');
        const findResult = await collection.deleteOne({ _id: new ObjectId(`${id}`) });
        // console.log(findResult);
        return findResult;
    } catch (error) {
        console.log(error);
    }
}
async function getDataById(id) {
    try {
        const db = client.db(dbName);
        const collection = db.collection('blogs');
        const findResult = await collection.findOne({ _id: new ObjectId(id) });
        // console.log(findResult);
        return findResult;
    } catch (error) {
        console.log(error);
    }
}
async function getDataByTitle(title) {
    try {
        const db = client.db(dbName);
        const collection = db.collection('blogs');
        const findResult = await collection.findOne({ title: title});
        // console.log(findResult);
        return findResult;
    } catch (error) {
        console.log(error);
    }
}

async function updateData(id, itemName, qty, img) {
    try {
        const db = client.db(dbName);
        const collection = db.collection('blogs');
        const updateFields = { item: itemName, qty: qty };
        if (img) {
            updateFields.image = img;
        }
        const insertResult = await collection.updateOne({ _id: new ObjectId(id) },
            {
                $set: updateFields,
                $currentDate: { lastModified: true }
            }
        )
        // console.log('Inserted documents =>', insertResult);
        return insertResult;
    } catch (error) {
        console.log(error);
    }
}


app.get("/", async (req, res) => {
    try {
        const result = await getData();
        // res.send(result);
        res.render('index', { data: result })
    } catch (err) {
        res.status(500).send('Error occurred: ' + err.message);
    }
})

app.post('/submit', upload.single('image'), async (req, res) => {
    let title = req.body.title
    let content = req.body.content
    let desc = req.body.desc
    let img = req.file ? req.file.buffer : undefined;
    await postData(title, content, desc, img)
    // console.log(req.body);
    res.redirect('/')
})
app.get('/delete/:id', async (req, res) => {
    const id = req.params.id
    // console.log(`ObjectId('${id}')` );
    await deleteData(id)
    res.redirect('/')
})

app.get('/update/:id', async (req, res) => {
    const id = req.params.id
    const data = await getDataById(id)
    // console.log(data);
    res.render('update', { data: data })
})
app.post('/update-data/:id', upload.single('image'), async (req, res) => {
    let id = req.params.id
    let item = req.body.item_name
    let quantity = Number(req.body.item_qty)
    let image = req.file ? req.file.buffer : undefined;

    await updateData(id, item, quantity, image)
    // console.log(req.body);
    res.redirect('/')
})


// API routes
app.get("/api/data", async (req, res) => {
    try {
        const result = await getData();
        res.json(result);
    } catch (err) {
        res.status(500).send('Error occurred: ' + err.message);
    }
});

app.get('/api/data/:id', async (req, res) => {
    const title = req.params.id;
    const data = await getDataByTitle(title);
    res.json(data);
});


app.listen(3000)
