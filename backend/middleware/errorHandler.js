const errorHandler = (err, req, res, next) => {
  console.error(err.stack);

  // If we already sent the response, delegate to default express handler
  if (res.headersSent) {
    return next(err);
  }

  res.status(500).json({ 
    message: err.message || 'Хатогӣ дар сервер',
    error: process.env.NODE_ENV === 'development' ? err : {}
  });
};

module.exports = errorHandler;
