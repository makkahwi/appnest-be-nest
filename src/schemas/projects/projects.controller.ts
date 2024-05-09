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

import { ProjectsService } from "./projects.service";
import { Project } from "../../entities/project.entity";
import { CreateProjectDto } from "../../dto/projects/create-project.dto";
import { UpdateProjectDto } from "../../dto/projects/update-project.dto";
import { ProjectFields, TablesNames } from "../../enums/tables-data.enum";
import { newInstanceTransformer } from "src/middlewares/transformers";

@ControllerWrapper("Projects")
export class ProjectsController {
    constructor(private readonly projectsService: ProjectsService) {}

    // --- Basic REST endpoints ---

    @Get()
    @GetAllWrapper({
        fieldsEnum: ProjectFields,
    })
    async getProjects(
        @Query()
        query: GetQueryProps<ProjectFields>,
        @Res() res: Response
    ) {
        const { sortBy, reverse, page, conditions } = query;
        const parsed: GetConditionsProps<ProjectFields>[] =
            validateGetConditions<ProjectFields>(conditions);

        const response: CustomResponseType<Project[]> =
            await this.projectsService.getProjects({
                sortBy,
                reverse: reverse === "true",
                page: Number(page),
                conditions: parsed || [],
            });
        return res.status(response.status).json(response);
    }

    @Get(":id")
    @MembersOnly()
    @ApiOperation({ summary: "get a single project using its ID" })
    async getProjectById(@Param("id") id: string, @Res() res: Response) {
        const response: CustomResponseType<Project> =
            await this.projectsService.getProjectById(id);

        return res.status(response.status).json(response);
    }

    @Post()
    @MembersOnly()
    @EditorsWrapper(CreateProjectDto, "create a new project")
    async createProject(
        @Body() createProjectDto: CreateProjectDto,
        @Res() res: Response
    ) {
        const response: CustomResponseType<Project> =
            await this.projectsService.createProject(
                newInstanceTransformer<CreateProjectDto>(
                    createProjectDto,
                    TablesNames.PROJECT
                )
            );

        return res.status(response.status).json(response);
    }

    @Patch(":id")
    @MembersOnly()
    @EditorsWrapper(UpdateProjectDto, "update a project")
    async updateProject(
        @Param("id") id: string,
        @Body() updateProjectDto: UpdateProjectDto,
        @Res() res: Response
    ) {
        const response: CustomResponseType<UpdateResult> =
            await this.projectsService.updateProject(
                id,
                newInstanceTransformer<UpdateProjectDto>(
                    updateProjectDto,
                    TablesNames.PROJECT
                )
            );

        return res.status(response.status).json(response);
    }

    @Delete("wipe")
    @AdminsOnly()
    @ApiOperation({ summary: "delete all projects" })
    async deleteAllProjects(@Res() res: Response) {
        const response: CustomResponseType<DeleteResult> =
            await this.projectsService.deleteAllProjects();

        return res.status(response.status).json(response);
    }

    @Delete(":id")
    @MembersOnly()
    @ApiOperation({ summary: "delete a project" })
    async deleteProject(@Param("id") id: string, @Res() res: Response) {
        const response: CustomResponseType<DeleteResult> =
            await this.projectsService.deleteProject(id);

        return res.status(response.status).json(response);
    }

    // --- Relational REST endpoints ---
}
