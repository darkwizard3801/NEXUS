import React, { useEffect, useState } from 'react';
import SummaryApi from '../common';

const RatingView = () => {
  const [ratings, setRatings] = useState([]);
  const [allProduct, setAllProduct] = useState([]);
  const [userEmail, setUserEmail] = useState(null);

  useEffect(() => {
    const fetchCurrentUser = async () => {
      try {
        const response = await fetch(SummaryApi.current_user.url, {
          method: SummaryApi.current_user.method,
          credentials: 'include',
          headers: {
            'Content-Type': 'application/json',
          },
        });
        const userData = await response.json();
        console.log('Current user data:', userData);
        setUserEmail(userData.data.email);
      } catch (error) {
        console.error('Error fetching current user:', error);
      }
    };

    const fetchAllProduct = async () => {
      try {
        const response = await fetch(SummaryApi.allProduct.url);
        const dataResponse = await response.json();

        if (Array.isArray(dataResponse?.data)) {
          console.log('Product data:', dataResponse.data);

          const filteredProducts = dataResponse.data.filter(
            (product) => product.user === userEmail
          );

          console.log('Filtered products:', filteredProducts);
          setAllProduct(filteredProducts);
        } else {
          console.error('Invalid product data format:', dataResponse);
        }
      } catch (error) {
        console.error('Error fetching products:', error);
      }
    };

    const fetchRatings = async () => {
      try {
        const response = await fetch(SummaryApi.getRating.url, {
          method: 'GET',
          credentials: 'include',
          headers: {
            'Content-Type': 'application/json',
          },
        });

        if (!response.ok) {
          throw new Error('Failed to fetch ratings');
        }

        const data = await response.json();
        console.log('Rating data', data);
        setRatings(data.data);
      } catch (error) {
        console.error('Error fetching ratings:', error);
      }
    };

    fetchCurrentUser().then(() => {
      fetchAllProduct();
      fetchRatings();
    });
  }, [userEmail]);

  const renderStars = (rating) => {
    const stars = [];
    for (let i = 1; i <= rating; i++) {
      stars.push(
        <span key={i} style={{ color: 'gold', fontSize: '20px' }}>
          ★
        </span>
      );
    }
    return stars;
  };

  return (
    <div className="container mx-5 p-5 ">
      {ratings.length > 0 && allProduct.length > 0 ? (
        <div className="grid gap-4 sm:grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {ratings
            .filter((rating) =>
              allProduct.some((product) => product._id === rating.productId)
            )
            .map((rating) => {
              const product = allProduct.find(
                (product) => product._id === rating.productId
              );

              return (
                <div
                  key={rating._id}
                  className="card mb-4 p-4 border rounded shadow-lg w-80 transition-transform transform hover:scale-105"
                >
                  {product?.productImage && (
                    <img
                      src={product.productImage[0]}
                      alt={product.productName}
                      className="w-full h-48 object-cover rounded mb-4"
                    />
                  )}
                  <h2 className="text-xl font-bold mb-2">
                    Order ID: {rating.orderId}
                  </h2>
                  <h3 className="text-lg font-semibold">
                    Product ID: {rating.productId}
                  </h3>
                  {product && (
                    <>
                      <h3 className="text-lg font-semibold">
                        Product Name: {product.productName}
                      </h3>
                      <p className="text-gray-600">
                        <b>Description:</b> {product.description}
                      </p>
                      <p className="text-gray-600"><b>Price: </b>₹{product.price}</p>
                      <p className="text-gray-600">
                        <b>Category:</b> {product.category}
                      </p>
                    </>
                  )}
                  <p className="mt-4"><b>Rating:</b> {renderStars(rating.rating)}</p>
                  <p className="text-gray-600 mt-2"><b>Review:</b> {rating.review}</p>
                </div>
              );
            })}
        </div>
      ) : (
        <p className="text-center text-gray-600">
          No ratings found for your products.
        </p>
      )}
    </div>
  );
};

export default RatingView;
