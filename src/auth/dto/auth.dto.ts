import { IsNotEmpty, IsEmail } from 'class-validator';

export class AuthDto {
  @IsEmail()
  @IsNotEmpty({ message: 'email cannot be empty' })
  email: string;

  @IsNotEmpty({ message: 'password cannot be empty' })
  password: string;
}
