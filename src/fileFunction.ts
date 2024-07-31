import { join, resolve } from "path";
import { MulterFile } from "./common/common.types";
import { existsSync, mkdirSync, unlinkSync, writeFileSync } from "fs";
import { InternalServerErrorException } from "@nestjs/common";
import * as AWS from 'aws-sdk';


function getPath(filePath?: string) {
  const defaultPath = resolve(__dirname, '../', 'uploads');
  return !filePath ? defaultPath : resolve(defaultPath, filePath);
}

export function uploadFileDisk(
  file: MulterFile,
  fileName: string,
  filePath?: string,
) {
  const uploadPath = getPath(filePath);

  if (!existsSync(uploadPath)) {
    mkdirSync(uploadPath, { recursive: true });
  }

  const writePath = join(uploadPath, fileName);
  writeFileSync(writePath, file.buffer); // file.path 임시 파일 저장소

  return `uploads${writePath.split('uploads')[1]}`.replace(/\\/gi, '/');
}


export function deleteFileDisk(fileName: string) {
  const serverUrl = process.env.SERVER_URL;
  const root = resolve(__dirname, '../');
  const filePath = join(root, fileName.replace(serverUrl, ''));

  if (existsSync(filePath)) {
    unlinkSync(filePath);
  }
}

export const getBlobFromURL = (url: string) => {
  return fetch(url).then((res) => {
    return res.blob();
  });
};

export const getBufferFromBlob = async (blob: Blob) => {
  const arrayBuffer = await blob.arrayBuffer();
  return Buffer.from(arrayBuffer);
};

export const uploadFileNaver = async (
  buffer: Buffer,
  contentType: string,
  filename: string,
) => {
  const AWS = require('aws-sdk');
  const s3 = new AWS.S3({
    endpoint: 'https://kr.object.ncloudstorage.com',
    region: 'kr-standard',
    accessKeyId: process.env.NAVER_ACCESS_KEY_ID,
    secretAccessKey: process.env.NAVER_SECRET_ACCESS_KEY,
  });

  const bucket = 'arts';

  const params = {
    Bucket: bucket,
    Key: filename,
    Body: buffer,
    ContentType: contentType,
    ACL: 'public-read',
  };

  try {
    await s3.upload(params).promise();

    return {
      filename,
      link: createPersistentDownloadUrl(bucket, filename),
      permalink: filename,
    };
  } catch (error) {
    console.log('에러발생');
    throw new InternalServerErrorException(
      error,
      'Failed to upload file on Naver Object Storage',
    );
  }
};

const createPersistentDownloadUrl = (bucket, key) => {
  return `https://kr.object.ncloudstorage.com/${bucket}/${encodeURIComponent(key)}`;
};

export const deleteFileNaver = async (filename: string) => {
  const s3 = new AWS.S3({
    endpoint: 'https://kr.object.ncloudstorage.com',
    region: 'kr-standard',
    accessKeyId: process.env.NAVER_ACCESS_KEY_ID,
    secretAccessKey: process.env.NAVER_SECRET_ACCESS_KEY,
  });

  const bucket = 'your-naver-bucket-name';

  const params = {
    Bucket: bucket,
    Key: filename,
  };

  try {
    await s3.deleteObject(params).promise();
  } catch (err) {
    throw new InternalServerErrorException(err, 'Fail to Delete Naver Object Storage file');
  }
};

export async function uploadImage(file: Express.Multer.File, folder: string = 'album-covers'): Promise<string> {
  const s3 = new AWS.S3({
    endpoint: 'https://kr.object.ncloudstorage.com',
    region: 'kr-standard',
    accessKeyId: process.env.NAVER_ACCESS_KEY_ID,
    secretAccessKey: process.env.NAVER_SECRET_ACCESS_KEY,
  });

  const uploadResult = await s3.upload({
    Bucket: 'arts',
    Key: `${folder}/${Date.now()}-${file.originalname}`,
    Body: file.buffer,
    ACL: 'public-read',
  }).promise();

  return uploadResult.Location; // 업로드된 파일의 URL 반환
}