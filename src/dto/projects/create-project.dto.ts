import { Length } from "class-validator";
import { ApiProperty } from "@nestjs/swagger";
export class CreateProjectDto {
    // --- Original fields ---

    @ApiProperty({
        required: true,
        description: "Project Short Description",
        default: "placeholder",
        example: "placeholder",
    })
    description: string;

    @Length(3, 25)
    @ApiProperty({
        required: true,
        description: "Name / title of the project",
        default: "placeholder",
        example: "placeholder",
    })
    title: string;

    // --- Relational fields ---
}
