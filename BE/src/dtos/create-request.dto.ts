// BE/src/dtos/create-request.dto.ts

import { IsNotEmpty, IsNumber, IsInt } from 'class-validator';
import { Type } from 'class-transformer';

export class CreateRequestDto {
  /**
   * Tầng bắt đầu của yêu cầu.
   * Phải là một số nguyên và không được để trống.
   */
  @IsNotEmpty({ message: 'fromFloor không được để trống' })
  @IsInt({ message: 'fromFloor phải là một số nguyên' }) // Sử dụng IsInt để chính xác hơn
  @Type(() => Number) // RẤT QUAN TRỌNG: Ép buộc giá trị phải được chuyển đổi thành number
  fromFloor: number;

  /**
   * Tầng đích của yêu cầu.
   * Phải là một số nguyên và không được để trống.
   */
  @IsNotEmpty({ message: 'toFloor không được để trống' })
  @IsInt({ message: 'toFloor phải là một số nguyên' })
  @Type(() => Number) // RẤT QUAN TRỌNG: Ép buộc giá trị phải được chuyển đổi thành number
  toFloor: number;
}