import { Injectable } from "@nestjs/common";
const toStream = require('buffer-to-stream'); 
import { v2 as cloudinary, UploadApiResponse } from "cloudinary";

@Injectable()
export class FileUploadRepository {
    async uploadImage(file: Express.Multer.File): Promise<UploadApiResponse> {
        return new Promise((resolve, reject) => {
            const upload = cloudinary.uploader.upload_stream(
                { resource_type: "image" },
                (error, result) => {
                    if (error) {
                        reject(error);
                    } else {
                        resolve(result!);
                    }
                },
            );

            toStream(file.buffer).pipe(upload);
        });
    }
}