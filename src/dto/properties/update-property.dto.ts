import { PartialType, ApiProperty } from "@nestjs/swagger";
import { CreatePropertyDto } from "./create-property.dto";

export class UpdatePropertyDto extends PartialType(CreatePropertyDto) {
    // --- Original fields ---

    @ApiProperty({
        description: "If modal property should be unique within table or not",
        required: false,
        example: false,
    })
    unique?: boolean;

    @ApiProperty({
        description: "Validation criteria for modal property",
        required: false,
        example: "",
    })
    regex?: string;

    @ApiProperty({
        description: "Default value to be auto filled to modal property",
        required: false,
        example: "",
    })
    defaultValue?: string;

    @ApiProperty({
        description: "If property fulfillment is required or optional",
        required: false,
        example: false,
    })
    required?: boolean;

    @ApiProperty({
        description: "Type of modal property",
        required: false,
        example: "",
    })
    type?: string;

    @ApiProperty({
        description: "Title / name / label of modal property",
        required: false,
        example: "",
    })
    title?: string;

    @ApiProperty({
        description: "The unique key of the property within the modal",
        required: false,
        example: "",
    })
    uniqueKey?: string;

    // --- Relational fields ---
    @ApiProperty({
        required: false,
        default: "",
        description: "enter the related modal ID",
    })
    modal?: string;
}
