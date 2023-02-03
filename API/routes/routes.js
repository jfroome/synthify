const Model = require('../models/model')
const express = require('express')
const router = express.Router()

module.exports = router

//Post Method
router.post('/listing/post', async (req, res) => {
  const data = {
    uid: req.body.uid,
    title: req.body.title,
    description: req.body.description,
    price: req.body.price,
    shipping: req.body.shipping,
    currency: req.body.currency,
    site: req.body.site,
    url: req.body.url,
    tags: req.body.tags,
    date_posted: req.body.posted,
    date_updated: new Date(),
    InStock: req.body.inStock
  }
  try {
    const filter = { uid: data.uid }

    const dataToSave = await Model.findOneAndUpdate(filter, data, {
      upsert: true // Make this update into an upsert
    })
    res.status(200).json(dataToSave)
  } catch (error) {
    res.status(400).json({ message: error.message })
  }
})

router.post('/listing/stock/post', async (req, res) => {
  console.log(req.body.url);
  try {
    const filter = { url: req.body.url }
    const update = { InStock: false }
    const dataToSave = await Model.findOneAndUpdate(filter,update,{ new: true })
    res.status(200).json(dataToSave)
  } catch (error) {
    res.status(400).json({ message: error.message })
  }
})

//Get all Method
router.get('/get', async (req, res) => {
  try {
    const data = await Model.find().sort({ price: 1 })
    res.json(data)
  } catch (error) {
    res.status(500).json({ message: error.message })
  }
})

router.get('/listing/stock/get', async (req, res) => {
  try {
    const data = await Model.find({ InStock: true, price: !null, InStock:true }).sort({ price: 1 })
    res.json(data)
  } catch (error) {
    res.status(500).json({ message: error.message })
  }
})

router.get('/links/get', async (req, res) => {
  try {
    const listings = await Model.find({ InStock: true }).sort({ site: -1 })
    const links = []
    listings.map(listing => {
      links.push(listing.url)
    })
    res.json({ links: links })
  } catch (error) {
    res.status(500).json({ message: error.message })
  }
})

//Get by ID Method
router.get('/get/:id', async (req, res) => {
  try {
    const data = await Model.findById(req.params.id)
    res.json(data)
  } catch (error) {
    res.status(500).json({ message: error.message })
  }
})

router.get('/find/', async (req, res) => {
  try {
    var keywords = req.body.title.split(' ')

    var searchKeywords = keywords.map(keyword => {
      return { title: new RegExp(keyword, 'i'), price: { $gt: 0 } }
    })

    const result = await Model.find({ $and: searchKeywords }).sort('price')
    const count = await Model.find({ $and: searchKeywords }).count()

    const averagePrice =
      result.reduce((partialSum, listing) => {
        if (listing.price == null || listing.price == 0) {
          return partialSum
        }
        return partialSum + listing.price
      }, 0) / count

    //var averagePrice = await result.reduce((partialSum, listing) => partialSum + (listing.price ?? 0), 0) / count;
    // var minPrice = result.reduce((partialSum, listing) => partialSum + listing.price ?? 0, 0) / count;
    // var maxPrice = result.reduce((partialSum, listing) => partialSum + listing.price ?? 0, 0) / count;

    res.json({ averagePrice, count, result })
  } catch (error) {
    res.status(500).json({ message: error.message })
  }
})

// //Update by ID Method
// router.patch('/update/:id', async (req, res) => {
//     try {
//         const id = req.params.id;
//         const updatedData = req.body;
//         const options = { new: true };

//         const result = await Model.findByIdAndUpdate(
//             id, updatedData, options
//         )

//         res.send(result)
//     }
//     catch (error) {
//         res.status(400).json({ message: error.message })
//     }
// });

// //Delete by ID Method
// router.delete('/delete/:id', async (req, res) => {
//     try {
//         const id = req.params.id;
//         const data = await Model.findByIdAndDelete(id)
//         res.send(`Document with ${data.name} has been deleted..`)
//     }
//     catch (error) {
//         res.status(400).json({ message: error.message })
//     }
// });
