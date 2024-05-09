import {
    Body,
    Delete,
    Get,
    Param,
    Patch,
    Post,
    Query,
    Res,
} from "@nestjs/common";
import { ApiOperation } from "@nestjs/swagger";
import { DeleteResult, UpdateResult } from "typeorm";
import { Response } from "express";

import {
    EditorsWrapper,
    MembersOnly,
    GetAllWrapper,
    AdminsOnly,
    GetConditionsProps,
    GetQueryProps,
    CustomResponseType,
    ControllerWrapper,
    validateGetConditions,
} from "src/ravennest";

import { PropertiesService } from "./properties.service";
import { Property } from "../../entities/property.entity";
import { CreatePropertyDto } from "../../dto/properties/create-property.dto";
import { UpdatePropertyDto } from "../../dto/properties/update-property.dto";
import { PropertyFields, TablesNames } from "../../enums/tables-data.enum";
import { newInstanceTransformer } from "src/middlewares/transformers";

@ControllerWrapper("Properties")
export class PropertiesController {
    constructor(private readonly propertiesService: PropertiesService) {}

    // --- Basic REST endpoints ---

    @Get()
    @GetAllWrapper({
        fieldsEnum: PropertyFields,
    })
    async getProperties(
        @Query()
        query: GetQueryProps<PropertyFields>,
        @Res() res: Response
    ) {
        const { sortBy, reverse, page, conditions } = query;
        const parsed: GetConditionsProps<PropertyFields>[] =
            validateGetConditions<PropertyFields>(conditions);

        const response: CustomResponseType<Property[]> =
            await this.propertiesService.getProperties({
                sortBy,
                reverse: reverse === "true",
                page: Number(page),
                conditions: parsed || [],
            });
        return res.status(response.status).json(response);
    }

    @Get(":id")
    @MembersOnly()
    @ApiOperation({ summary: "get a single property using its ID" })
    async getPropertyById(@Param("id") id: string, @Res() res: Response) {
        const response: CustomResponseType<Property> =
            await this.propertiesService.getPropertyById(id);

        return res.status(response.status).json(response);
    }

    @Post()
    @MembersOnly()
    @EditorsWrapper(CreatePropertyDto, "create a new property")
    async createProperty(
        @Body() createPropertyDto: CreatePropertyDto,
        @Res() res: Response
    ) {
        const response: CustomResponseType<Property> =
            await this.propertiesService.createProperty(
                newInstanceTransformer<CreatePropertyDto>(
                    createPropertyDto,
                    TablesNames.PROPERTY
                )
            );

        return res.status(response.status).json(response);
    }

    @Patch(":id")
    @MembersOnly()
    @EditorsWrapper(UpdatePropertyDto, "update a property")
    async updateProperty(
        @Param("id") id: string,
        @Body() updatePropertyDto: UpdatePropertyDto,
        @Res() res: Response
    ) {
        const response: CustomResponseType<UpdateResult> =
            await this.propertiesService.updateProperty(
                id,
                newInstanceTransformer<UpdatePropertyDto>(
                    updatePropertyDto,
                    TablesNames.PROPERTY
                )
            );

        return res.status(response.status).json(response);
    }

    @Delete("wipe")
    @AdminsOnly()
    @ApiOperation({ summary: "delete all properties" })
    async deleteAllProperties(@Res() res: Response) {
        const response: CustomResponseType<DeleteResult> =
            await this.propertiesService.deleteAllProperties();

        return res.status(response.status).json(response);
    }

    @Delete(":id")
    @MembersOnly()
    @ApiOperation({ summary: "delete a property" })
    async deleteProperty(@Param("id") id: string, @Res() res: Response) {
        const response: CustomResponseType<DeleteResult> =
            await this.propertiesService.deleteProperty(id);

        return res.status(response.status).json(response);
    }

    // --- Relational REST endpoints ---
    @Get("/modal/:id")
    @GetAllWrapper({
        summary: "get all properties that has the same modal ID",
        fieldsEnum: PropertyFields,
        isMainGet: false,
    })
    @ApiOperation({})
    async getPropertiesByModalId(
        @Param("id") id: string,
        @Query()
        query: Omit<GetQueryProps<PropertyFields>, "conditions">,
        @Res() res: Response
    ) {
        const { sortBy, reverse, page } = query;
        const response: CustomResponseType<Property[]> =
            await this.propertiesService.getPropertiesByModalId({
                id,
                sortBy,
                reverse: reverse === "true",
                page: Number(page),
            });
        return res.status(response.status).json(response);
    }
}
