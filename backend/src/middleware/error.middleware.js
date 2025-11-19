export const errorMiddleware = (err, req, res, next)=>{

    let statusCode = err.code || 500;
    let message = err.message || "something went wrong";
    res.status(statusCode).json({message, success:false})
}