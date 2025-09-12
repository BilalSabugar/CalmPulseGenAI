// // server.js
// const express = require('express');
// const stripe = require('@stripe/stripe-react-native')('sk_test_tR3PYbcVNZZ796tH88S4VQ2u');

// const app = express();
// const PORT = 3001;

// app.use(express.json());

// // Endpoint to create a payment intent
// app.post('/create-payment-intent', async (req, res) => {
//   try {
//     const { amount, currency, payment_method_types } = req.body;

//     const paymentIntent = await stripe.paymentIntents.create({
//       amount,
//       currency,
//       payment_method_types,
//     });

//     res.status(200).json({ clientSecret: paymentIntent.client_secret });
//   } catch (error) {
//     console.error(error);
//     res.status(500).json({ error: 'Internal Server Error' });
//   }
// });

// app.listen(PORT, () => {
//   console.log(`Server is running on port ${PORT}`);
// });
