export function newResponse(data, status) {
    return new Response(JSON.stringify(data), { status });
  }