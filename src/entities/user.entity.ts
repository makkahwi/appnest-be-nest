import {
    IsEmail,
    IsEnum,
    IsPhoneNumber,
    IsUUID,
    Length,
    Matches,
} from "class-validator";
import { UserGender, UserRole } from "src/enums/users.enum";
import { Entity, Column, PrimaryGeneratedColumn } from "typeorm";

@Entity()
export class User {
    @PrimaryGeneratedColumn("uuid")
    @IsUUID()
    id: string;

    @Column({
        default: new Date(),
        nullable: false,
    })
    createdAt: Date;

    @Length(3, 25)
    @Column({
        nullable: false,
        unique: true,
    })
    username: string;

    @Length(2, 25)
    @Column({
        nullable: false,
    })
    firstName: string;

    @Length(2, 25)
    @Column({
        nullable: false,
    })
    lastName: string;

    @IsEmail()
    @Column({
        unique: true,
        nullable: false,
    })
    email: string;

    @Length(8, 25)
    @Matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).{8,}$/)
    @Column({
        nullable: false,
    })
    password: string;

    @IsPhoneNumber()
    @Column({
        nullable: true,
    })
    phoneNumber?: string;

    @Length(1, 255)
    @Column({
        nullable: true,
    })
    address?: string;

    @IsEnum(UserGender)
    @Column({
        type: "enum",
        enum: UserGender,
        nullable: true,
        default: UserGender.NOT_SPECIFIED,
    })
    gender: UserGender;

    @IsEnum(UserRole)
    @Column({
        type: "enum",
        enum: UserRole,
        nullable: true,
        default: UserRole.MEMBER,
    })
    role: UserRole;

    @Column({
        nullable: true,
    })
    avatar: string;

    @Column({
        nullable: true,
        default: "",
    })
    token?: string;

    // --- relations ---
}
