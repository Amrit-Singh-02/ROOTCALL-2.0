import joi from "joi";

export let registerSchema = joi.object({
  name: joi.string().min(3).max(15).required(),
  username: joi.string().alphanum().min(3).max(30).required(),
  password: joi.string().pattern(new RegExp("^[a-zA-Z0-9]{8,30}$")).required(),
});
