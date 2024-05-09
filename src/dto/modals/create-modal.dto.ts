import { Length } from "class-validator";
import { ApiProperty } from "@nestjs/swagger";
export class CreateModalDto {
    // --- Original fields ---
    @Length(3, 25)
    @ApiProperty({
        required: true,
        description: "Modal title / name",
        default: "placeholder",
        example: "placeholder",
    })
    title: string;

    // --- Relational fields ---
    @ApiProperty({
        required: true,
        description: "enter the related project ID",
    })
    project: string;
}
