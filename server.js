const dotenv = require('dotenv')
const express = require('express')
const moment = require('moment')
const bodyParser = require('body-parser')
const cors = require('cors')
const fs = require('fs')
// const redisClientPromise = require('./redisClientPromise')

dotenv.config()

//express setup
const app = express()
app.use(cors())
app.use(bodyParser.json())

app.get('/ping', async (req, res) => {
	res.json({
		pong: true
	})
})

app.get('/file/:path', async (req, res) => {
	const path = 'cache/' + req.params.path
	const hoursStaleLimit = +req.query.hoursStaleLimit

	if (fs.existsSync(path)) {
		const hoursStale = moment().diff(fs.statSync(path).mtime, 'minutes') / 60
		if (hoursStale >= hoursStaleLimit && hoursStaleLimit >= 0) {
			// console.log('found (stale) ' + path)
			res.sendStatus(404)
		} else {
			// console.log('found ' + path)
			res.json(JSON.parse(fs.readFileSync(path)))
		}
	} else {
		// console.log('not found ' + path)
		res.sendStatus(404)
	}
})

app.post('/file/:path', async (req, res) => {
	if (!fs.existsSync('cache')) fs.mkdirSync('cache')

	const path = 'cache/' + req.params.path
	fs.writeFileSync(path, JSON.stringify(req.body), {flag: 'w'})
	res.sendStatus(200)
})

const port = process.env.PORT || 3001
app.listen(port, () => console.log(`Listening on port ${port}...`))
