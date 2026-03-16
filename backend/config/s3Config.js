import { S3Client, GetObjectCommand } from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';

const s3Config = {
    credentials: {
        accessKeyId: process.env.AWS_ACCESS_KEY_ID,
        secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY
    },
    region: process.env.AWS_REGION
};

if (process.env.AWS_ENDPOINT) {
    s3Config.endpoint = process.env.AWS_ENDPOINT;
}

if (process.env.AWS_FORCE_PATH_STYLE === 'true') {
    s3Config.forcePathStyle = true;
}

const s3Client = new S3Client(s3Config);

// Function to generate presigned URL
export const generatePresignedUrl = async (key) => {
    const command = new GetObjectCommand({
        Bucket: process.env.AWS_BUCKET_NAME,
        Key: key
    });

    // URL expires in 1 hour
    return await getSignedUrl(s3Client, command);
};

export default s3Client;