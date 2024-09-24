import React, { useContext, useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import SummaryApi from '../common';
import displayINRCurrency from '../helpers/displayCurrency';
import CategroyWiseProductDisplay from '../components/CategoryWiseProductDisplay';
import addToCart from '../helpers/addToCart';
import Context from '../context';
import { FaStar, FaStarHalf } from "react-icons/fa";

const ProductDetails = () => {
  const [data, setData] = useState({
    productName: "",
    brandName: "",
    category: "",
    productImage: [],
    description: "",
    price: "",
  });
  const params = useParams();
  const [loading, setLoading] = useState(true);
  const [activeImage, setActiveImage] = useState("");
  const [quantity, setQuantity] = useState(1);
  const [rating, setRating] = useState({ fullStars: 0, hasHalfStar: false }); // New state for rating

  const { fetchUserAddToCart } = useContext(Context);
  const navigate = useNavigate();

  const fetchProductDetails = async () => {
    setLoading(true);
    const response = await fetch(SummaryApi.productDetails.url, {
      method: SummaryApi.productDetails.method,
      headers: {
        "content-type": "application/json",
      },
      body: JSON.stringify({
        productId: params?.id,
      }),
    });
    setLoading(false);
    const dataResponse = await response.json();
    setData(dataResponse?.data);
    setActiveImage(dataResponse?.data?.productImage[0]);
    
    // Generate a random rating: 2, 3, or 4 full stars
    const randomFullStars = Math.floor(Math.random() * 3) + 2; // Generates 2, 3, or 4

    // Decide whether to include a half star or not (50% chance)
    const includeHalfStar = Math.random() < 0.5; // 50% chance to include half star

    setRating({ fullStars: randomFullStars, hasHalfStar: includeHalfStar });
  };

  useEffect(() => {
    fetchProductDetails();
  }, [params]);

  const handleAddToCart = async (e, id) => {
    await addToCart(e, id, quantity);
    fetchUserAddToCart();
  };

  const handleBuyProduct = async (e, id) => {
    await addToCart(e, id, quantity);
    fetchUserAddToCart();
    navigate("/cart");
  };

  const handleImageHover = (img) => {
    setActiveImage(img);
  };

  return (
    <div className='container mx-auto p-4'>
      <div className='min-h-[200px] flex flex-col lg:flex-row gap-4'>
        {/* Product Image */}
        <div className='h-96 flex flex-col lg:flex-row-reverse gap-4'>
          <div className='h-[300px] w-[300px] lg:h-96 lg:w-96 bg-slate-200 relative p-2 overflow-hidden'>
            <div className='relative w-full h-full overflow-hidden'>
              <img
                src={activeImage}
                className='h-full w-full object-cover transition-transform duration-300 transform hover:scale-125'
                alt="Active product"
              />
            </div>
          </div>
          <div className='h-full'>
            {
              loading ? (
                <div className='flex gap-2 lg:flex-col overflow-scroll scrollbar-none h-full'>
                  {/* Placeholder */}
                </div>
              ) : (
                <div className='flex gap-2 lg:flex-col overflow-scroll scrollbar-none h-full'>
                  {
                    data?.productImage?.map((imgURL, index) => (
                      <div 
                        className='h-20 w-20 bg-slate-200 rounded p-1' 
                        key={index}
                        onMouseEnter={() => handleImageHover(imgURL)} // Change image on hover
                      >
                        <img
                          src={imgURL}
                          className='w-full h-full object-scale-down mix-blend-multiply cursor-pointer'
                          alt={`Thumbnail ${index}`}
                        />
                      </div>
                    ))
                  }
                </div>
              )
            }
          </div>
        </div>

        {/* Product Details */}
        {
          loading ? (
            <div className='grid gap-1 w-full'>
              {/* Loading Skeleton */}
            </div>
          ) : (
            <div className='flex flex-col gap-1'>
              <p className='bg-red-200 text-red-600 px-2 rounded-full inline-block w-fit'>{data?.brandName}</p>
              <h2 className='text-2xl lg:text-4xl font-medium'>{data?.productName}</h2>
              <p className='capitalize text-slate-400'>{data?.category}</p>
              <div className='text-red-600 flex items-center gap-1'>
                {
                  // Render full stars based on random number
                  Array.from({ length: rating.fullStars }).map((_, index) => <FaStar key={index} />)
                }
                {/* Render half star if applicable */}
                {rating.hasHalfStar && <FaStarHalf />}
              </div>
              {/* Product Price */}
              <div className='flex items-center gap-2 text-2xl lg:text-3xl font-medium my-1'>
                <p className='text-red-600'>{displayINRCurrency(data.price)}</p>
              </div>

              {/* Quantity Input */}
              {["catering", "rent", "bakers"].includes(data?.category) && (
                <div className='flex flex-col gap-2'>
                  <label htmlFor='quantity' className='font-medium text-slate-600'>Quantity</label>
                  <input
                    type='number'
                    id='quantity'
                    value={quantity}
                    min="1"
                    onChange={(e) => setQuantity(e.target.value)}
                    className='border border-slate-400 p-2 rounded w-24'
                  />
                </div>
              )}

              {/* Action Buttons */}
              <div className='flex items-center gap-3 my-2'>
                <button
                  className='border-2 border-red-600 rounded px-3 py-1 min-w-[120px] text-red-600 font-medium hover:bg-red-600 hover:text-white'
                  onClick={(e) => handleBuyProduct(e, data?._id)}
                >
                  Book Now
                </button>
                <button
                  className='border-2 border-red-600 rounded px-3 py-1 min-w-[120px] font-medium text-white bg-red-600 hover:text-red-600 hover:bg-white'
                  onClick={(e) => handleAddToCart(e, data?._id)}
                >
                  Add To Cart
                </button>
              </div>

              <div>
                <p className='text-slate-600 font-medium my-1'>Description:</p>
                <p>{data?.description}</p>
              </div>
            </div>
          )
        }
      </div>

      {data.category && (
        <CategroyWiseProductDisplay category={data?.category} heading={"Recommended Products"} />
      )}
    </div>
  );
}

export default ProductDetails;
