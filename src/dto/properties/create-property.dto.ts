import { ApiProperty } from "@nestjs/swagger";
export class CreatePropertyDto {
    // --- Original fields ---

    @ApiProperty({
        description: "If modal property should be unique within table or not",
        required: false,
        default: false,
        example: false,
    })
    unique: boolean;

    @ApiProperty({
        description: "Validation criteria for modal property",
        required: false,
        default: "placeholder",
        example: "placeholder",
    })
    regex: string;

    @ApiProperty({
        description: "Default value to be auto filled to modal property",
        required: false,
        default: "placeholder",
        example: "placeholder",
    })
    defaultValue: string;

    @ApiProperty({
        description: "If property fulfillment is required or optional",
        required: false,
        default: false,
        example: false,
    })
    required: boolean;

    @ApiProperty({
        required: true,
        description: "Type of modal property",
        default: "placeholder",
        example: "placeholder",
    })
    type: string;

    @ApiProperty({
        required: true,
        description: "Title / name / label of modal property",
        default: "placeholder",
        example: "placeholder",
    })
    title: string;

    @ApiProperty({
        required: true,
        description: "The unique key of the property within the modal",
        default: "placeholder",
        example: "placeholder",
    })
    uniqueKey: string;

    // --- Relational fields ---
    @ApiProperty({ required: true, description: "enter the related modal ID" })
    modal: string;
}
