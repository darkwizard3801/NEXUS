const uploadProductPermission = require("../../helpers/permission")
const productModel = require("../../models/productModel")

async function UploadProductController(req, res) {
    try {
        const sessionUserId = req.userId

        if (!uploadProductPermission(sessionUserId)) {
            throw new Error("Permission denied")
        }

        // Extract data from request body
        const productData = {
            ...req.body
            
        };

        // If it's a catering product, validate and structure the catering data
        if (productData.category === "Catering" && productData.catering) {
            // Validate course type
            const validCourseTypes = ['3', '5', '7', '10'];
            if (!validCourseTypes.includes(productData.catering.courseType)) {
                throw new Error("Invalid course type selected");
            }

            // Validate courses data
            if (!Array.isArray(productData.catering.courses) || 
                productData.catering.courses.length !== parseInt(productData.catering.courseType)) {
                throw new Error(`Expected ${productData.catering.courseType} courses but received ${productData.catering.courses?.length || 0}`);
            }

            // Validate each course has required fields and proper structure
            productData.catering.courses.forEach((course, index) => {
                // Check required fields
                if (!course.courseName) {
                    throw new Error(`Course name is required for course ${index + 1}`);
                }
                if (!course.courseType) {
                    throw new Error(`Course type is required for course ${index + 1}`);
                }
                if (!Array.isArray(course.dishes)) {
                    throw new Error(`Dishes must be an array for course ${index + 1}`);
                }
                if (course.dishes.length === 0) {
                    throw new Error(`At least one dish is required for course ${index + 1}`);
                }

                // Validate each dish
                course.dishes.forEach((dish, dishIndex) => {
                    if (!dish || typeof dish !== 'string' || dish.trim().length === 0) {
                        throw new Error(`Invalid dish at position ${dishIndex + 1} in course ${index + 1}`);
                    }
                });

                // Validate additional notes if present
                if (course.additionalNotes && typeof course.additionalNotes !== 'string') {
                    throw new Error(`Additional notes must be text for course ${index + 1}`);
                }
            });
        }

        const uploadProduct = new productModel(productData)
        const saveProduct = await uploadProduct.save()

        res.status(201).json({
            message: "Product uploaded successfully",
            error: false,
            success: true,
            data: saveProduct
        })

    } catch (err) {
        console.error('Upload Product Error:', err);
        res.status(400).json({
            message: err.message || "Error uploading product",
            error: true,
            success: false
        })
    }
}

module.exports = UploadProductController