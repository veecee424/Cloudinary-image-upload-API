const express = require("express");
const fileUpload = require("express-fileupload");
const dotenv = require("dotenv").config();
const swaggerUi = require("swagger-ui-express");
const swaggerDocument = require('./swagger.json');
const swaggerJsdoc = require('swagger-jsdoc');


const app = express();
app.use(fileUpload({
    useTempFiles : true,
}));

const cloudinary = require("cloudinary").v2;
cloudinary.config({
    cloud_name: process.env.CLOUD_NAME,
    api_key: process.env.API_KEY,
    api_secret: process.env.API_SECRET
});



//SWAGGER SETUP
const options = {
    swaggerDefinition: {
      openapi: "3.0.0",
      info: {
        title: "Time to document that Express API you built",
        version: "1.0.0",
        description:
          "A test project to understand how easy it is to document and Express API",
        license: {
          name: "MIT",
          url: "https://choosealicense.com/licenses/mit/"
        },
        contact: {
          name: "Swagger",
          url: "https://swagger.io",
          email: "Info@SmartBear.com"
        }
      },
      servers: [
        {
          url: "http://localhost:5000"
        }
      ]
    },
    apis: ["./models/images.js", "./app.js"]
  };
  
  const specs = swaggerJsdoc(options);
  
  app.use("/", swaggerUi.serve);
  
  app.get(
    "/",
    swaggerUi.setup(specs, {
      explorer: true
    })
  );
  
  app.get("/", swaggerUi.setup(specs, { explorer: true }));



  /**
 * @swagger
 * path:
 *  /upload/:
 *    post:
 *      summary: Uploads an image
 *      requestBody:
 *        content:
 *          multipart/form-data: 
 *            schema:
 *              type: object
 *              properties:        
 *                  file:
 *                      type: string
 *                      format: binary        
 *      responses:
 *        "200":
 *          description: A user image
 *          content: 
 *            image/png:
 *              schema:
 *                $ref: '#/components/schemas/Image'
 */

//UPLOAD ROUTE
app.post("/upload", function(req, res) {
 
    if(req.files == undefined) {
        return res.json({Error: "Select an image file"});
    }
    
    const file = req.files.file;
      

       if (file.size > 1000000) {
        return res.json({Sorry: "File too large, must be less than 1mb"});
    } 
 
    if (file.mimetype != 'image/png') { 
        if(file.mimetype != 'image/jpeg') {
            return res.json({Error: "Uplaod a valid image format (png, jpg, jpeg)"})
        }
    }


    cloudinary.uploader.upload(file.tempFilePath, { responsive_breakpoints: { 
        create_derived: true, bytes_step: 20000, min_width: 200, max_width: 200, 
        transformation: { crop: 'fill', aspect_ratio: '1:1', gravity: 'auto' } } }, function(err, result) {
        
        if(err) {
            return res.json({error: err});
        }
           result.responsive_breakpoints.forEach(function(image) {
            image.breakpoints.forEach(function(responsive_image) {
                return res.json({responsive_image});
                
            });
           })
           
        });
}); 




app.listen(5000, function() {
    console.log("running on 5k")
})