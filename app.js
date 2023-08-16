import express from "express"
import crypto from "node:crypto"
import movies from "./movies.json" assert { type: 'json'}
import { validateMovie, validatePartialMovie} from "./Schemas/movies.js"
import cors from 'cors'

const app = express()

app.use(express.json())
app.use(cors({
    origin: (origin, callback) => {
        const ACCEPTED_ORIGINS = [
            'http://localhost:8080',
            'http://localhost:1234',
            'https://movies.com',
            'https://midu.dev'
        ]

        if(ACCEPTED_ORIGINS.includes(origin)) {
            return callback(null, true)
        }

        if(!origin) {
            return callback(null, true)
        }

        return callback(new Error('Not allowed by CORS'))
    }
}))
app.disable('x-powered-by');



app.get('/movies', (req, res) => {
    
    
    const { genre } = req.query
    if(genre){
        const filteredMovies = movies.filter(
            movie => movie.genre.some(g => g.toLowerCase() === genre.toLowerCase())
        )
        return res.json(filteredMovies)
    }
    res.json(movies)
})

app.post('/movies', (req, res) => {
    
    const result = validateMovie(req.body)

    if(result.error){
        return res.status(400).json({ error: JSON.parse(result.error.message) })
    }

    const newMovie = {
        id: crypto.randomUUID(),
        ...result.data
    }
    movies.push(newMovie)

    res.status(201).json(newMovie)
})

app.patch('/movies/:id', (req,res) => {
   
    const result = validatePartialMovie(req.body)

    if(result.error){
        return res.status(400).json({ error: JSON.parse(result.error.message) })
    }
    const { id } = req.params

    const movieIndex = movies.findIndex(movie => movie.id === id)

    if(movieIndex === -1) {
        return res.status(400).json({ message: 'Movie not found' })
    }

    const updateMovie = {
        ...movies[movieIndex],
        ...result.data
    }
    

    movies[movieIndex] = updateMovie

    res.status(201).json(updateMovie)
})

app.get('/movies/:id', (req, res) => {
    const {id} = req.params
    const movie = movies.find(movie => movie.id === id)
    if(movie) return res.json(movie)

    res.status(404).json({ message: 'Movie not found' })
})

app.delete('/movies/:id', (req, res) => {

    const { id } = req.params

    const movieIndex = movies.findIndex(movie => movie.id === id)

    if(movieIndex === -1){
        return res.status(404).json({ message: 'Movie not found' })
    }

    movies.slice(movieIndex, 1)

    return res.json({ message: 'Movie deleted '})
});

const PORT = process.env.PORT ?? 1234

app.listen(PORT, () => {
    console.log(`server listening on port http://localhost:${PORT}`);
})