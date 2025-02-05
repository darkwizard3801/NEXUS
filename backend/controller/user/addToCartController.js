const addToCartModel = require("../../models/cartProduct");

const addToCartController = async (req, res) => {
  try {
    const { productId, quantity } = req.body;
    const currentUser = req.userId;

    // Ensure quantity is a number
    const productQuantity = parseInt(quantity, 10);
    console.log(productQuantity)

    // Check if the product is already in the cart for the current user
    const isProductInCart = await addToCartModel.findOne({ productId, userId: currentUser });

    if (isProductInCart) {
      // Increment quantity with the new value passed in the request
      isProductInCart.quantity += productQuantity;
      const updatedCartProduct = await isProductInCart.save();

      return res.json({
        data: updatedCartProduct,
        message: "Product quantity updated in cart",
        success: true,
        error: false,
      });
    }

    // If product not in cart, create a new entry
    const payload = {
      productId: productId,
      quantity: productQuantity, // Set initial quantity
      userId: currentUser,
    };

    const newAddToCart = new addToCartModel(payload);
    const saveProduct = await newAddToCart.save();

    return res.json({
      data: saveProduct,
      message: "Product added to cart",
      success: true,
      error: false,
    });

  } catch (err) {
    return res.json({
      message: err.message || err,
      error: true,
      success: false,
    });
  }
};

const addToCartWithConfigController = async (req, res) => {
  try {
    const { productId, quantity, configuration } = req.body;
    const currentUser = req.userId;

    // Ensure quantity is a number
    const productQuantity = parseInt(quantity, 10);
    console.log('Product Quantity:', productQuantity);
    console.log('Configuration:', configuration);

    // Check if the product is already in the cart for the current user with the same configuration
    const isProductInCart = await addToCartModel.findOne({ 
      productId, 
      userId: currentUser,
      configuration: configuration // Include configuration in the search
    });

    if (isProductInCart) {
      // Increment quantity with the new value passed in the request
      isProductInCart.quantity += productQuantity;
      const updatedCartProduct = await isProductInCart.save();

      return res.json({
        data: updatedCartProduct,
        message: "Product quantity updated in cart",
        success: true,
        error: false,
      });
    }

    // If product not in cart or has different configuration, create a new entry
    const payload = {
      productId: productId,
      quantity: productQuantity,
      userId: currentUser,
      configuration: configuration // Add configuration to the payload
    };

    const newAddToCart = new addToCartModel(payload);
    const saveProduct = await newAddToCart.save();

    return res.json({
      data: saveProduct,
      message: "Product added to cart with configuration",
      success: true,
      error: false,
    });

  } catch (err) {
    return res.json({
      message: err.message || err,
      error: true,
      success: false,
    });
  }
};

module.exports = { addToCartController, addToCartWithConfigController };



