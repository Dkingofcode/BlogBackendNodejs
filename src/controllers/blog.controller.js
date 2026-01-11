const express = require("express");
const Blog = require("../models/Blog");


const getAllBlogs = async (req, res) => {
    try {
        const blogs = await Blog.find();
        res.json(blogs);
    }catch(error){
        res.status(500).json({ message: error.message });
    }
};


const getSingleBlog = async (req, res) => {
    try {
        const blog = await Blog.findById(req.params.id);
        if (!blog) {
            return res.status(404).json({ message: "Blog not found" });
        }
        res.json(blog);
    }catch(error){
        res.status(500).json({ message: error.message });
    }
};

const createBlog = async (req, res) => {
    const { title, content, author, tags } = req.body;

    const blog = new Blog({ title, content, author, tags });

    try {
        const newBlog = await blog.save();
        res.status(201).json(newBlog);
    }catch(error){
        res.status(500).json({ message: error.message });
    }
};


const updateBlog = async (req, res) => {
    const { title, content, author, tags } = req.body;
    try{
        const updatedBlog = awaitBlog.findByIdAndUpdate(req.params.id, { title, content, author, tags }, { new: true });
        if (!updatedBlog){
            return res.status(404).json({ message: "Blog not found" });
        }
        res.json(updatedBlog);
    }catch(error){
        res.status(400).json({ message: error.message });
    }
};




const deleteBlog = async (req, res) => {
    try{
        const deletedBlog = await Blog.findByIdAndRemove(req.params.id);
        if(!deletedBlog){
            return res.status(404).json({ message: "Blog not found" });
        }
        res.json({ message: "Blog deleted "});
    }catch(error){
        res.status(500).json({ message: error.message });
    }
};



module.exports = { getAllBlogs, getSingleBlog, createBlog, updateBlog, deleteBlog };


















