const asyncHandler = require("express-async-handler");
const User = require("../../model/user/user.model");
require('fs').promises;

const postController ={

 //!Create post
 createPost: asyncHandler(async (req, res) => {}),
 uploads:asyncHandler(async (req, res) => {
    try {
        //req.file for single file : req.files for multiple files [array of object]
        if (!req.file || Object.keys(req.file).length === 0) {
          return res.status(400).json({ message: 'No files were uploaded.' });
        }
    
        // const user = await User.findByIdAndUpdate(
        //     {_id:req.auth_id}, {$set: {profilePic: req.file.path}}, {new: true, upsert:true}
        //)
    
        const user = await User.findById(req.auth_id);
        oldPic = user.profilePic ?? null;
        if (oldPic) {
    
          // Below for disk storage deletion
          /*const  oldPicPath = path.join(process.cwd(), oldPic)
          try {
            await fs.unlink(oldPicPath)   
          } catch (error) {
            //
          } 
          */
    
          // Below for cloudinary deletion
          let id = oldPic.split('/').pop().split('.')[0];
          const { status, error } = await cloudDelete(id);
          if (!status) console.log(error);
        }
    
        // Below for ordianry cloudinary uploading without using (multer-storage-cloudinary)
        /*
        newPicPath = path.join(process.cwd(), req.file.path)
        const { object: cloudinaryObject, error } = await cloudUpload(newPicPath);
        if (error) {
          return res.status(500).json({ message: error.message })
        }
        await fs.unlink(newPicPath)
        user.profilePic = cloudinaryObject.secure_url;
        */
    
        // Using (multer-storage-cloudinary) i.e not pre-saving file to local disk
        user.profilePic = req.file.path;
        user.save();
        const _user = excludeFields(user.toObject(), ["otp", "password", "__v"])
        return res.status(200).json({ user: _user })
    
      } catch (error) {
        console.log(error);
        return res.status(500).json({ message: "Internal server error" });
      }
 }),

};


module.exports = postController;

