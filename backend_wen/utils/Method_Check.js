async function MethodValidate(req, res, next, method) {
  //+++++++++++++++++++++++++++++++++++++++++++++++
  const allowedMethods = method.toUpperCase();
  
  //+++++++++++++++++++++++++++++++++++++++++++++++
  if (req.method !== allowedMethods) {
      const error = new Error("Method not matched");
      error.status = 405;
      return next(error);
  }
  next();
}
module.exports = { MethodValidate };