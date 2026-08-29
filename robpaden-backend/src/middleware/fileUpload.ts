import multer from "multer";

const storage = multer.memoryStorage();

export const uploadMiddleware = multer({
  storage,
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB limit
  },
});

export const uploadSingleFile = (fieldName: string) => {
  return uploadMiddleware.single(fieldName);
};

export const uploadMultipleFields = (fields: multer.Field[]) => {
  return uploadMiddleware.fields(fields);
};
