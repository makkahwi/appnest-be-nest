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

import { ModalsService } from "./modals.service";
import { Modal } from "../../entities/modal.entity";
import { CreateModalDto } from "../../dto/modals/create-modal.dto";
import { UpdateModalDto } from "../../dto/modals/update-modal.dto";
import { ModalFields, TablesNames } from "../../enums/tables-data.enum";
import { newInstanceTransformer } from "src/middlewares/transformers";

@ControllerWrapper("Modals")
export class ModalsController {
    constructor(private readonly modalsService: ModalsService) {}

    // --- Basic REST endpoints ---

    @Get()
    @GetAllWrapper({
        fieldsEnum: ModalFields,
    })
    async getModals(
        @Query()
        query: GetQueryProps<ModalFields>,
        @Res() res: Response
    ) {
        const { sortBy, reverse, page, conditions } = query;
        const parsed: GetConditionsProps<ModalFields>[] =
            validateGetConditions<ModalFields>(conditions);

        const response: CustomResponseType<Modal[]> =
            await this.modalsService.getModals({
                sortBy,
                reverse: reverse === "true",
                page: Number(page),
                conditions: parsed || [],
            });
        return res.status(response.status).json(response);
    }

    @Get(":id")
    @MembersOnly()
    @ApiOperation({ summary: "get a single modal using its ID" })
    async getModalById(@Param("id") id: string, @Res() res: Response) {
        const response: CustomResponseType<Modal> =
            await this.modalsService.getModalById(id);

        return res.status(response.status).json(response);
    }

    @Post()
    @MembersOnly()
    @EditorsWrapper(CreateModalDto, "create a new modal")
    async createModal(
        @Body() createModalDto: CreateModalDto,
        @Res() res: Response
    ) {
        const response: CustomResponseType<Modal> =
            await this.modalsService.createModal(
                newInstanceTransformer<CreateModalDto>(
                    createModalDto,
                    TablesNames.MODAL
                )
            );

        return res.status(response.status).json(response);
    }

    @Patch(":id")
    @MembersOnly()
    @EditorsWrapper(UpdateModalDto, "update a modal")
    async updateModal(
        @Param("id") id: string,
        @Body() updateModalDto: UpdateModalDto,
        @Res() res: Response
    ) {
        const response: CustomResponseType<UpdateResult> =
            await this.modalsService.updateModal(
                id,
                newInstanceTransformer<UpdateModalDto>(
                    updateModalDto,
                    TablesNames.MODAL
                )
            );

        return res.status(response.status).json(response);
    }

    @Delete("wipe")
    @AdminsOnly()
    @ApiOperation({ summary: "delete all modals" })
    async deleteAllModals(@Res() res: Response) {
        const response: CustomResponseType<DeleteResult> =
            await this.modalsService.deleteAllModals();

        return res.status(response.status).json(response);
    }

    @Delete(":id")
    @MembersOnly()
    @ApiOperation({ summary: "delete a modal" })
    async deleteModal(@Param("id") id: string, @Res() res: Response) {
        const response: CustomResponseType<DeleteResult> =
            await this.modalsService.deleteModal(id);

        return res.status(response.status).json(response);
    }

    // --- Relational REST endpoints ---
    @Get("/project/:id")
    @GetAllWrapper({
        summary: "get all modals that has the same project ID",
        fieldsEnum: ModalFields,
        isMainGet: false,
    })
    @ApiOperation({})
    async getModalsByProjectId(
        @Param("id") id: string,
        @Query()
        query: Omit<GetQueryProps<ModalFields>, "conditions">,
        @Res() res: Response
    ) {
        const { sortBy, reverse, page } = query;
        const response: CustomResponseType<Modal[]> =
            await this.modalsService.getModalsByProjectId({
                id,
                sortBy,
                reverse: reverse === "true",
                page: Number(page),
            });
        return res.status(response.status).json(response);
    }
}
