import CustomError from "../utils/CustomError.js"

export const validate = (schema)=>{
    return (req, res, next)=>{
        let {error, value} = schema.validate(req.body, {abortEarly : false})
        if(error){
            next(
                new CustomError(`${error.details.map(ele=>ele.message)}`)
            )
        } 
        req.body = value;
        next()
    }
}