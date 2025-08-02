const Product = require('../models/Product');

// Get all products
exports.getAllProducts = async (req, res) => {
    try {
        const products = await Product.find();
        res.json(products);
    } catch (err) {
        res.status(500).send('Server error');
    }
};

// Create a new product (Admin only)
exports.createProduct = async (req, res) => {
    const { name, description, price, imageUrl } = req.body;
    try {
        const newProduct = new Product({
            name,
            description,
            price,
            imageUrl,
        });
        const product = await newProduct.save();
        res.json(product);
    } catch (err) {
        res.status(500).send('Server error');
    }
};
// Add these two new functions

// Update a product (Admin only)
// Update a product (Admin only)
exports.updateProduct = async (req, res) => {
    try {
        // Use findByIdAndUpdate for a direct update
        const product = await Product.findByIdAndUpdate(
            req.params.id, 
            req.body, 
            { new: true } // This option returns the updated document
        );

        if (!product) {
            return res.status(404).json({ msg: 'Product not found' });
        }

        res.json(product);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
};

// Delete a product (Admin only)
exports.deleteProduct = async (req, res) => {
    try {
        const product = await Product.findByIdAndDelete(req.params.id); // <-- This is the corrected line

        if (!product) {
            return res.status(404).json({ msg: 'Product not found' });
        }

        res.json({ msg: 'Product removed' });
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
};