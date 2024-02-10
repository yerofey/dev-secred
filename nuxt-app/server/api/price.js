export default defineEventHandler(async (event) => {
  const query = getQuery(event);
  const coin = query.coin || 'bitcoin';
  const currency = query?.currency || 'usd';

  // Set Cache-Control header to prevent caching
  setHeader(event, 'Cache-Control', 'no-store, max-age=0');

  try {
    const url = `https://api.coingecko.com/api/v3/simple/price?ids=${coin}&vs_currencies=${currency}`;
    const response = await $fetch(url);
    return response[coin][currency] || 0;
  } catch (error) {
    console.error('Error fetching price:', error);
    return createError({
      statusCode: 500,
      statusMessage: 'Internal Server Error',
    });
  }
});
