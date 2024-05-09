import { PartialType, ApiProperty } from "@nestjs/swagger";
import { CreateModalDto } from "./create-modal.dto";

export class UpdateModalDto extends PartialType(CreateModalDto) {
    // --- Original fields ---

    @ApiProperty({
        description: "Modal title / name",
        required: false,
        example: "",
    })
    title?: string;

    // --- Relational fields ---
    @ApiProperty({
        required: false,
        default: "",
        description: "enter the related project ID",
    })
    project?: string;
}
