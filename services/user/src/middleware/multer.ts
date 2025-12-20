import multer from "multer";

// tells multer to store file in RAM (memory), NOT on disk. This gives us file.buffer 

const storage = multer.memoryStorage()

// Create middleware - .single("file") means: expect exactly ONE file, the form field name must be "file"

const uploadFile = multer({storage}).single("file") ; 

export default uploadFile ; 

