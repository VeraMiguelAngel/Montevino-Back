import { v2 as cloudinary } from 'cloudinary';
import { configDotenv } from 'dotenv';

configDotenv({ path: ".development.env"});

export const CloudinaryConfig = {
    provide: "CLOUDINARY",
    useFactory: () => {
        return cloudinary.config({
            cloud_name: process.env.CLOUD_NAME,
            api_key: process.env.API_KEY,
            api_secret: process.env.API_SECRET,
        });
    },
};