const Product = require("../models/productModel");
const ErrorHander = require("../utils/errorhander");
const catchAsyncErrors = require("../middleware/catchAsyncErrors");
const ApiFeatures = require("../utils/apifeatures");
const cloudinary = require("cloudinary");
const e = require("express");


//Create Product -- Admin
exports.createProduct = catchAsyncErrors(async (req, res, next) => {

    let images = [];

    if (typeof req.body.images === "string") {
        images.push(req.body.images);
    } else {
        images = req.body.images;
    }

    const imagesLinks = [];

    for (let i = 0; i < images.length; i++) {
        const result = await cloudinary.v2.uploader.upload(images[i], {
            folder: "products",
        });
        imagesLinks.push({
            public_id: result.public_id,
            url: result.secure_url,
        });
    }

    req.body.images = imagesLinks;
    req.body.user = req.user.id;



    /////////////////////////////////////////////////////////////





    // let images = req.body.images; //Lấy mảng các ảnh từ yêu cầu

    // if (!Array.isArray(images)) {
    //     images = [images];
    // }




    //giải thuyết bản thân là đúng
    // const names = req.body.name;
    // if (names == "cc") {
    //     return next(new ErrorHander("cctn"), 400);
    // }



    //kiểm tra nếu không có ảnh được gủi
    // if (!images || !Array.isArray(images) || images.length === 0) {
    //     return next(new ErrorHander("Please provide at least 1 image", 400));
    // }

    /////////////////////////////////


    // if (!Array.isArray(images) || images.length === 0) {
    //     return next(new ErrorHander("CLMM"), 400);
    // }

    // const imagesLinks = [];
    //Duyệt qua mỗi ảnh trong mảng và tải lên cloudinary
    // for (let i = 0; i < images.length; i++) {
    //     // return next(new ErrorHander(images.length), 400);
    //     const result = await cloudinary.v2.uploader.upload(images[i].url, {
    //         folder: "products",
    //     });
    //     imagesLinks.push({
    //         public_id: result.public_id,
    //         url: result.secure_url,
    //     });
    // }

    // req.body.images = imagesLinks; //Gán đường dẫn ảnh đã tải lên cho req.body.images
    // req.body.user = req.user.id;

    ///////////////////////////////////


    // req.body.user = req.user.id;

    const product = await Product.create(req.body)

    res.status(201).json({
        success: true,
        product,
    });
});





//Get ALL Product
exports.getAllProducts = catchAsyncErrors(async (req, res, next) => {


    const resultPerPage = 8;
    const productsCount = await Product.countDocuments();


    if (req.query.random) {
        const products = await Product.aggregate([{ $sample: { size: resultPerPage } }]);
        res.status(200).json({
            success: true,
            productsCount,
            resultPerPage,
            products,
        });
    } else {

        const apiFeature = new ApiFeatures(Product.find(), req.query)
            .search()
            .filter();

        let product = await apiFeature.query;
        let filteredProductsCount = product.length;

        apiFeature.pagination(resultPerPage);
        const productsQuery = apiFeature.query.clone();
        const products = await productsQuery;

        res.status(200).json({
            success: true,
            productsCount,
            resultPerPage,
            filteredProductsCount,
            products,
        });

    }

    // const apiFeature = new ApiFeatures(Product.find(), req.query)
    //     .search()
    //     .filter();  /*quantrong*/






    // const paginatedApiFeature = new ApiFeatures(apiFeature.query, req.query).pagination(resultPerPage);

    // const products = await apiFeature.query; //gốc.

    // const products = await paginatedApiFeature.query;

    // let products = await apiFeature.query;cố định sẵn

    // let filteredProductsCount = products.length; //gốc nó là let

    // apiFeature.pagination(resultPerPage); //gốc

    // products = await apiFeature.query; cố định sẵn


    /*Cái này của GPT */
    // const currentPage = req.query.page || 1;
    // const products = await apiFeature.query;
    // const startIndex = (currentPage - 1) * resultPerPage;
    // const endIndex = currentPage * resultPerPage;
    // const paginatedProducts = products.slice(startIndex, endIndex);


    /*Cái này của BlackBox AI */
    // apiFeature.pagination(resultPerPage);
    // const filteredProductsCount = apiFeature.query.clone().countDocuments();
    // const productsQuery = apiFeature.query;
    // const products = await productsQuery.skip(resultPerPage * (req.query.page - 1)).limit(resultPerPage);

    // const productsQuery = apiFeature.query.clone();
    // const products = await productsQuery;
    // const filteredProductsCount = products.length;
    // const paginatedProducts = await apiFeature.query.skip(resultPerPage * (req.query.page - 1)).limit(resultPerPage);





    //Tự nghĩ
    // let product = await apiFeature.query;
    // let filteredProductsCount = product.length;

    // apiFeature.pagination(resultPerPage);

    // const productsQuery = apiFeature.query.clone();
    // const products = await productsQuery;






    //Áp dụng lấy sản phẩm ngẫu nhiên

    // const conditions = apiFeature.getFilter();
    // const products = await Product.aggregate([
    //     { $match: apiFeature.query._conditions },
    //     { $sample: { size: resultPerPage } }
    // ]);


    // res.status(200).json({
    //     success: true,
    //     products,
    //     productsCount,
    //     resultPerPage,
    //     filteredProductsCount,
    // });

});

//Get ALL Products --Admin
exports.getAdminProducts = catchAsyncErrors(async (req, res, next) => {

    const products = await Product.find();


    res.status(200).json({
        success: true,
        products,
    });

});

//Get Product Details

exports.getProductDetails = catchAsyncErrors(async (req, res, next) => {
    const product = await Product.findById(req.params.id);
    if (!product) {
        return next(new ErrorHander("Product Not Found", 404));
    }

    res.status(200).json({
        success: true,
        product,
    });
});

//Update Product -- Admin

exports.updateProduct = catchAsyncErrors(async (req, res, next) => {
    let product = await Product.findById(req.params.id);

    // if (!product) {
    //     return res.status(500).json({
    //         success: false,
    //         message: "Product not found"
    //     })
    // }
    if (!product) {
        return next(new ErrorHander("Product Not Found", 404));
    }

    //Images Start here
    let images = [];
    if (typeof req.body.images === "string") {
        images.push(req.body.images);
    } else {
        images = req.body.images;
    }

    if (images !== undefined) {
        //Deleting Images From Cloudinary
        for (let i = 0; i < product.images.length; i++) {
            await cloudinary.v2.uploader.destroy(product.images[i].public_id);
        }
        const imagesLinks = [];

        for (let i = 0; i < images.length; i++) {
            const result = await cloudinary.v2.uploader.upload(images[i], {
                folder: "products",
            });

            imagesLinks.push({
                public_id: result.public_id,
                url: result.secure_url,
            });
        }
        req.body.images = imagesLinks;

    }







    product = await Product.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true, useFindAndModify: false });

    res.status(200).json({
        success: true,
        product
    });
});




//Delete Product
exports.deleteProduct = catchAsyncErrors(async (req, res, next) => {

    const product = await Product.findById(req.params.id);

    // if (!product) {
    //     return res.status(500).json({
    //         success: false,
    //         message: "Product not found"
    //     })
    // }
    if (!product) {
        return next(new ErrorHander("Product Not Found", 404));
    }

    //Deleting Images From Cloudinary
    for (let i = 0; i < product.images.length; i++) {

        await cloudinary.v2.uploader.destroy(product.images[i].public_id);
    }

    await product.deleteOne();

    res.status(200).json({
        success: true,
        message: "Product Delete Successfully"
    });
});


//Create New Review or Update the review
exports.createProductReview = catchAsyncErrors(async (req, res, next) => {
    const { rating, comment, productId } = req.body;
    const review = {
        user: req.user._id,
        name: req.user.name,
        rating: Number(rating),
        comment,
    };
    const product = await Product.findById(productId);

    const isReviewed = product.reviews.find(rev => rev.user.toString() === req.user._id)

    if (isReviewed) {
        product.reviews.array.forEach(rev => {
            if (rev.user.toString() === req.user._id.toString())
                rev.rating = rating,
                    rev.comment = comment
        });
    }
    else {
        product.reviews.push(review);
        product.numOfReviews = product.reviews.length
    }


    let avg = 0;

    product.reviews.forEach((rev) => {
        avg = avg + rev.rating;
    })

    product.ratings = avg
        / product.reviews.length;

    await product.save({ validateBeforeSave: false });

    res.status(200).json({
        success: true,

    });
});

//Get all Reviews of a product
exports.getProductReviews = catchAsyncErrors(async (req, res, next) => {
    // const product = await Product.findById(req.query.productId); //gốc
    const product = await Product.findById(req.query.id);

    if (!product) {
        return next(new ErrorHander("Product not found", 404));
    }

    res.status(200).json({
        success: true,
        reviews: product.reviews,
    });
});
//Delete review
exports.deleteReview = catchAsyncErrors(async (req, res, next) => {
    const product = await Product.findById(req.query.productId);

    if (!product) {
        return next(new ErrorHander("Product not found"), 404);
    }

    const reviews = product.reviews.filter(rev => rev._id.toString() !== req.query.id.toString());

    let avg = 0;
    reviews.forEach((rev) => {
        avg += rev.rating;
    });

    let ratings = 0;

    if (reviews.length === 0) {
        ratings = 0;
    } else {
        ratings = avg / reviews.length;
    }

    const numOfReviews = reviews.length;

    // const ratings = avg / reviews.length;

    console.log(avg);
    console.log(reviews.length);
    console.log(ratings);



    await Product.findByIdAndUpdate(req.query.productId, {
        reviews,
        ratings,
        numOfReviews,
    },
        {
            new: true,
            runValidators: true,
            useFindAndModify: false,
        });

    res.status(200).json({
        success: true,

    })
})