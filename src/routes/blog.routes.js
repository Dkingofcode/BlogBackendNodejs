const express = require('express');
const router = express.Router();
const Blog = require("../models/Blog");

const { getAllBlogs, getSingleBlog, createBlog, updateBlog, deleteBlog } = require("../controllers/blog.controller");


// Get all blogs
router.get('/', getAllBlogs);


// Get a single blod By ID
router.get('/:id', getSingleBlog);


// Create a new Blog
router.post('/', createBlog);


// Update a blog by ID
router.put('/:id', updateBlog);


router.delete('/:id', deleteBlog);


module.exports = router;