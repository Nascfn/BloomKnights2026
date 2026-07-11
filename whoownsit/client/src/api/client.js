export async function analyzeImage(file, monthly) {
  const formData = new FormData();
  formData.append('image', file);

  try {
    const response = await fetch(`/api/analyze?monthly=${encodeURIComponent(monthly)}`, {
      method: 'POST',
      body: formData,
    });

    return await response.json();
  } catch (error) {
    return {
      status: 'ERROR',
      message: error instanceof Error ? error.message : 'Unable to analyze image.',
    };
  }
}
