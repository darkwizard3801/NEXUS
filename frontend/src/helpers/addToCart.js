import SummaryApi from "../common"
import { toast } from 'react-toastify'

const addToCart = async (e, id, quantity) => {
    e?.stopPropagation();
    e?.preventDefault();

    // Ensure quantity is passed as a number
    const qtyToSend = parseInt(quantity, 10); 
    console.log(qtyToSend)
    const response = await fetch(SummaryApi.addToCartProduct.url, {
        method: SummaryApi.addToCartProduct.method,
        credentials: 'include',
        headers: {
            "content-type": 'application/json',
        },
        body: JSON.stringify({
            productId: id,
            quantity: qtyToSend,
        }),
    });

    const responseData = await response.json();

    if (responseData.success) {
        toast.success(responseData.message);
    }

    if (responseData.error) {
        toast.error(responseData.message);
    }

    return responseData;
};



export default addToCart