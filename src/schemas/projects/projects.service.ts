import { Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { DeleteResult, Repository, UpdateResult } from "typeorm";

import {
    foundRes,
    notFoundRes,
    newInstanceRes,
    deletedRes,
    errorRes,
    filterNullsObject,
    GetAllProps,
    CustomResponseType,
    filteredGetQuery,
    validateNewInstance,
} from "src/ravennest";

import { Project } from "../../entities/project.entity";
import { CreateProjectDto } from "../../dto/projects/create-project.dto";
import { UpdateProjectDto } from "../../dto/projects/update-project.dto";
import { ProjectFields } from "../../enums/tables-data.enum";

@Injectable()
export class ProjectsService {
    constructor(
        @InjectRepository(Project)
        private readonly projectRepository: Repository<Project>
        // ----- external services -----
    ) {}

    // --- Basic REST APIs ---

    async getProjects({
        sortBy = Object.values(ProjectFields)[0],
        reverse = false,
        page = 1,
        conditions,
    }: GetAllProps<ProjectFields>): Promise<CustomResponseType<Project[]>> {
        try {
            const findQuery = filteredGetQuery({
                sortBy,
                reverse,
                page,
                conditions,
            });

            if (findQuery.status !== 200) {
                return notFoundRes(findQuery.message);
            }

            const response = await this.projectRepository.find(findQuery.data);

            return foundRes(
                response.length
                    ? "Projects have been found"
                    : "Projects list is empty",
                response
            );
        } catch (error) {
            return errorRes(error.message);
        }
    }

    async getProjectById(id: string): Promise<CustomResponseType<Project>> {
        try {
            const response = await this.projectRepository.findOneBy({ id });

            if (!response) return notFoundRes("Project does not exist");

            return foundRes("Project has been found", response);
        } catch (error) {
            return errorRes(error.message);
        }
    }

    async createProject(
        createProjectDto: CreateProjectDto
    ): Promise<CustomResponseType<Project>> {
        try {
            // filter any nulls
            const filteredData =
                filterNullsObject<CreateProjectDto>(createProjectDto);
            // validate the provided fields
            await validateNewInstance({
                dto: CreateProjectDto,
                data: filteredData,
            });
            // deconstruction
            const {
                // --- DUMMY_TABLE_NAME_CREATE ---
                ...rest
            } = filteredData;

            const projectObj = { ...rest };

            // --- Table ID check - create ---

            // ----------------------

            // create the object and save it in the DB
            const newProject = this.projectRepository.create(projectObj);
            const response = await this.projectRepository.save(newProject);
            // --- Post-response - create ---

            // ----------------------
            // return the response
            return newInstanceRes<Project>(
                "Project has been created successfully",
                response
            );
        } catch (error) {
            return errorRes(error.message);
        }
    }

    async updateProject(
        id: string,
        updateProjectDto: UpdateProjectDto
    ): Promise<CustomResponseType<UpdateResult>> {
        try {
            // filter any nulls
            const filteredData =
                filterNullsObject<UpdateProjectDto>(updateProjectDto);
            // validate the provided fields
            await validateNewInstance({
                dto: UpdateProjectDto,
                data: filteredData,
            });
            // check if the id exists
            const project = await this.getProjectById(id);
            if (!project) {
                return notFoundRes(`Project does not exist`);
            }
            // deconstruction
            const {
                // --- DUMMY_TABLE_NAME_UPDATE ---
                ...rest
            } = filteredData;

            const projectObj = { ...rest };

            // --- Table ID check - update ---

            // ----------------------

            // create the object and save it in the DB
            const response = await this.projectRepository.update(
                {
                    id,
                },
                projectObj
            );
            // --- Post-response - update ---

            // ----------------------
            // return the response
            return newInstanceRes<UpdateResult>(
                "Project has been updated successfully",
                response
            );
        } catch (error) {
            return errorRes(error.message);
        }
    }

    async deleteAllProjects(): Promise<CustomResponseType<DeleteResult>> {
        try {
            const response = await this.projectRepository.query(
                `TRUNCATE TABLE "project" CASCADE;`
            );

            return deletedRes("Projects data are wiped out", response);
        } catch (error) {
            return errorRes(error.message);
        }
    }

    async deleteProject(id: string): Promise<CustomResponseType<DeleteResult>> {
        try {
            const response = await this.projectRepository.delete(id);

            if (!response) {
                return notFoundRes("Project does not exist");
            }

            return deletedRes(
                "Project has been deleted successfully",
                response
            );
        } catch (error) {
            return errorRes(error.message);
        }
    }

    // --- Relational REST APIs ---
}
