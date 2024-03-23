import { S3Client, DeleteObjectCommand  } from '@aws-sdk/client-s3';
import multer from 'multer';
import multerS3 from 'multer-s3';
import { randomBytes } from 'crypto';
import { getEnv } from './getEnv';

export const s3 = new S3Client({ 
	region: 'sa-east-1',
	credentials: {
        accessKeyId: process.env.AWS_ACCESS_KEY_ID!,
        secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY!,
    }
});

export const upload = multer({
	storage: multerS3({
		s3: s3,
		acl: 'public-read',
		bucket: "geoprospect",
		contentType: multerS3.AUTO_CONTENT_TYPE,

		key: function (req, file, cb) {
			cb(null, randomBytes(10).toString('hex'));
		}
	}),

	fileFilter: (req, file: Express.Multer.File, cb) => {
		const allowedMimes = [
			'image/png',
			'image/jpg',
			'image/jpeg'
		];

		if(!allowedMimes.includes(file.mimetype)){
			cb(new Error('Invalid file type'));
		}

		cb(null, true);
	},

	limits: { fileSize: 5 * 1024 * 1024 }
});

export async function deleteObject(key: string) {
	try {
		const params = {
			Bucket: process.env.AWS_BUCKET_NAME,
			Key: key,
		};

		await s3.send(new DeleteObjectCommand(params));
		console.log(`Object '${key}' deleted successfully.`);
	} catch (error) {
		console.error(`Error deleting object '${key}':`, error);
		throw error;
	}
}