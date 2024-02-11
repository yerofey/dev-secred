export default defineEventHandler(async (event) => {
  const config = useRuntimeConfig();
  const query = getQuery(event);
  const userAddress = query.address || '';
  const startBlock = query.startBlock || '0';
  const endBlock = query.endBlock || '99999999';
  const sort = query.sort || 'desc';

  if (!userAddress) {
    return createError({
      statusCode: 400,
      statusMessage: 'Bad Request',
    });
  }

  try {
    const url = `${config.public.scanApiUrl}?module=account&action=txlist&address=${userAddress}&startblock=${startBlock}&endblock=${endBlock}&sort=${sort}&apikey=${config.public.scanApiKey}`; // TODO: use private API key
    const response = await $fetch(url);
    // Optionally, filter or modify the response as needed before sending it to the client
    return response; // Return the fetched data directly or process it as needed
  } catch (error) {
    // Handle any errors that occur during the fetch
    console.error('Error fetching transactions:', error);
    return createError({
      statusCode: 500,
      statusMessage: 'Internal Server Error',
    });
  }
});
