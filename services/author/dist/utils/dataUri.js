import DataUriParser from "datauri/parser.js";
import path from "path";
// converting buffer to Cloudinary-friendly format - takes multer req.file 
const getBuffer = (file) => {
    const parser = new DataUriParser(); // Create Data URI Parser
    // extract file extension from original filename. example: "photo.png" -> ".png"
    const extName = path.extname(file.originalname).toString();
    // Converts buffer -> data URI. Returns something like: data:image/png;base64;fhiwiurewl
    return parser.format(extName, file.buffer);
};
export default getBuffer;
//# sourceMappingURL=dataUri.js.map