import { PartialType, ApiProperty } from "@nestjs/swagger";
import { CreateProjectDto } from "./create-project.dto";

export class UpdateProjectDto extends PartialType(CreateProjectDto) {
    // --- Original fields ---

    @ApiProperty({
        description: "Project Short Description",
        required: false,
        example: "",
    })
    description?: string;

    @ApiProperty({
        description: "Name / title of the project",
        required: false,
        example: "",
    })
    title?: string;

    // --- Relational fields ---
}
