const user= require('../model/user.model')
console.log(user);

const signup = async(req,res)=>{
    console.log(req.body);
}



module.exports = {
    signup

};