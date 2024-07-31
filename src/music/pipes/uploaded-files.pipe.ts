import { BadRequestException, PipeTransform } from '@nestjs/common';
import { MulterFile } from 'src/common/common.types';

export class UploadedFilesPipe implements PipeTransform {
  transform(uploadedFiles: {
    musics?: MulterFile[];
    cover?: MulterFile[];
    datas?: MulterFile[];
  }) {
    const { musics, cover, datas } = uploadedFiles;
    if (!musics || !datas) {
      throw new BadRequestException(
        `Can't find ${!musics && 'music file'} ${!datas && 'music data'}`,
      );
    }

    if (musics.length !== datas.length) {
      throw new BadRequestException(`Mismatch between number of music files and data entries`);
    }

    const parsedData = datas.map(data => {
      const parsed = JSON.parse(data.buffer.toString());
      // Ensure selectedCategories is processed correctly
      // parsed.selectedCategories = parsed.selectedCategories.map(category => category.trim());
      return parsed;
    });

    return {
      musics: musics,
      cover: cover?.length ? cover[0] : undefined,
      data: parsedData,
    };
  }
}
