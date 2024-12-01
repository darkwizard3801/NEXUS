import React, { useState, useEffect } from 'react';
import { 
  Grid, Card, Typography, Box, Table, TableBody,
  TableCell, TableContainer, TableHead, TableRow,
  Paper, Chip, CircularProgress 
} from '@mui/material';
import SummaryApi from '../common';

const VendorReport = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [userEmail, setUserEmail] = useState(null);

  // Fetch current user's email
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
      setError('Failed to fetch user information');
    }
  };

  // Fetch orders for the current vendor
  const fetchOrders = async () => {
    if (!userEmail) return;

    try {
      setLoading(true);
      const response = await fetch(SummaryApi.orderDetails.url, {
        method: SummaryApi.orderDetails.method,
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
        },
      });
      const dataResponse = await response.json();
      console.log('All orders:', dataResponse);
      console.log('Current user email:', userEmail);

      if (Array.isArray(dataResponse?.data)) {
        // Filter orders for the current vendor
        const products = dataResponse.data.products
        console.log("products",products);
        const filteredOrders = dataResponse.data.filter(order => {
          console.log('Checking order:', order);
          console.log('Order vendor:', order.products?.vendor);
          return order.products?.vendor === userEmail;
        });

        console.log('Filtered orders:', filteredOrders);
        setOrders(filteredOrders);
      } else {
        console.error('Invalid orders data format:', dataResponse);
        setError('Invalid data format received');
      }
    } catch (error) {
      console.error('Error fetching orders:', error);
      setError('Failed to load orders');
    } finally {
      setLoading(false);
    }
  };

  // First fetch user data, then fetch orders
  useEffect(() => {
    fetchCurrentUser();
  }, []);

  useEffect(() => {
    if (userEmail) {
      fetchOrders();
    }
  }, [userEmail]);

  const getStatusColor = (status) => {
    switch (status.toLowerCase()) {
      case 'delivered':
        return 'success';
      case 'processing':
        return 'warning';
      case 'cancelled':
        return 'error';
      default:
        return 'default';
    }
  };

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h4" sx={{ mb: 3 }}>
        Vendor Dashboard
      </Typography>

      {/* Orders Table Section */}
      <Card sx={{ mb: 3 }}>
        <Box sx={{ p: 2 }}>
          <Typography variant="h6" gutterBottom>
            Recent Orders
          </Typography>
        </Box>
        
        {loading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', p: 3 }}>
            <CircularProgress />
          </Box>
        ) : error ? (
          <Box sx={{ p: 2, color: 'error.main' }}>
            <Typography>{error}</Typography>
          </Box>
        ) : (
          <TableContainer component={Paper}>
            <Table>
              <TableHead>
                <TableRow sx={{ backgroundColor: '#f5f5f5' }}>
                  <TableCell>Order ID</TableCell>
                  <TableCell>Customer</TableCell>
                  <TableCell>Date</TableCell>
                  <TableCell>Items</TableCell>
                  <TableCell align="right">Amount</TableCell>
                  <TableCell>Status</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {orders.map((order) => (
                  <TableRow key={order._id} hover>
                    <TableCell>{order.orderId}</TableCell>
                    <TableCell>{order.customerName || 'N/A'}</TableCell>
                    <TableCell>
                      {new Date(order.createdAt).toLocaleDateString()}
                    </TableCell>
                    <TableCell>
                      {order.items.map(item => item.name).join(', ')}
                    </TableCell>
                    <TableCell align="right">
                      ${order.totalAmount?.toFixed(2)}
                    </TableCell>
                    <TableCell>
                      <Chip 
                        label={order.status} 
                        color={getStatusColor(order.status)}
                        size="small"
                      />
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        )}
      </Card>

      {/* Rest of your dashboard components... */}
    </Box>
  );
};

export default VendorReport;
